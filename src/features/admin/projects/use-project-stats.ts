import { useEffect, useState } from 'react';
import { serviceApi } from '../../../core/api/service-api';

export interface ProjectStats {
  /** Total deployed service instances in the project. */
  instances: number;
  /** Distinct service types among those instances. */
  services: number;
  /** False until the per-instance metric requests have settled. */
  metricsLoaded: boolean;
  /** Summed CPU usage in cores; null when no instance reports it. */
  cpuUsed: number | null;
  /** Summed memory usage in bytes; null when no instance reports it. */
  memUsed: number | null;
}

/** Per-project KPI aggregates for the projects list: instance counts arrive
 *  first (one request per project), CPU/memory sums follow (one request per
 *  instance, like the overview's summary but rolled up per project). */
export function useProjectStats(projectNames: string[]): Record<string, ProjectStats> {
  // Joined key keeps the effect stable across re-renders that rebuild the
  // array with the same content.
  const namesKey = projectNames.join('|');
  const [stats, setStats] = useState<Record<string, ProjectStats>>({});

  useEffect(() => {
    const names = namesKey ? namesKey.split('|') : [];
    let cancelled = false;

    const mergeStats = (name: string, value: ProjectStats) => {
      if (!cancelled) {
        setStats((prev) => ({ ...prev, [name]: value }));
      }
    };

    for (const name of names) {
      // Skip projects already aggregated (the list grows via SSE events;
      // existing rows keep their numbers).
      if (stats[name]) continue;
      (async () => {
        let base: ProjectStats;
        try {
          const instances = await serviceApi.getServices(name);
          base = {
            instances: instances.length,
            services: new Set(instances.map((i) => i.service)).size,
            metricsLoaded: instances.length === 0,
            cpuUsed: null,
            memUsed: null,
          };
          mergeStats(name, base);

          if (instances.length === 0) return;
          const metrics = await Promise.all(
            instances.map((i) => serviceApi.getServiceMetrics(name, i.name).catch(() => null)),
          );
          let cpu = 0;
          let mem = 0;
          let cpuSeen = false;
          let memSeen = false;
          for (const m of metrics) {
            if (m?.cpu?.available) {
              cpu += m.cpu.usedRaw;
              cpuSeen = true;
            }
            if (m?.memory?.available) {
              mem += m.memory.usedRaw;
              memSeen = true;
            }
          }
          mergeStats(name, {
            ...base,
            metricsLoaded: true,
            cpuUsed: cpuSeen ? cpu : null,
            memUsed: memSeen ? mem : null,
          });
        } catch {
          mergeStats(name, {
            instances: 0,
            services: 0,
            metricsLoaded: true,
            cpuUsed: null,
            memUsed: null,
          });
        }
      })();
    }

    return () => {
      cancelled = true;
    };
    // `stats` is intentionally read without re-triggering: the effect only
    // fans out for names it has not aggregated yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namesKey]);

  return stats;
}
