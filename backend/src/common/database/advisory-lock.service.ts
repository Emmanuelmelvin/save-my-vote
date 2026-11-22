import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export type LockResult<T> = { acquired: true; result: T } | { acquired: false };

/**
 * PostgreSQL session advisory locks: "only one of us at a time" across every API
 * instance, without holding a transaction open while slow work (like sending
 * email) runs.
 */
@Injectable()
export class AdvisoryLockService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async tryWithLock<T>(
    key: string,
    work: () => Promise<T>,
  ): Promise<LockResult<T>> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    try {
      const [{ locked }] = (await runner.query(
        'SELECT pg_try_advisory_lock(hashtext($1)) AS locked',
        [key],
      )) as Array<{ locked: boolean }>;
      if (!locked) return { acquired: false };
      try {
        return { acquired: true, result: await work() };
      } finally {
        await runner.query('SELECT pg_advisory_unlock(hashtext($1))', [key]);
      }
    } finally {
      await runner.release();
    }
  }
}
