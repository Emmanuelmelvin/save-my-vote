// Decorators from class-validator, class-transformer and TypeORM read and write
// design-time metadata, which needs the Reflect polyfill loaded first (main.ts does
// the same for the real app).
import 'reflect-metadata';
