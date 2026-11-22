import { parse } from 'csv-parse/sync';
import { isEmail } from 'class-validator';

export interface VoterInput {
  email: string;
  fullName?: string;
}

export interface RowError {
  /** 1-based line number in the file (the header is line 1). */
  row: number;
  email: string;
  reason: string;
}

export interface ParsedVoters {
  voters: VoterInput[];
  errors: RowError[];
}

const EMAIL_HEADERS = ['email', 'emailaddress', 'mail'];
const NAME_HEADERS = ['fullname', 'name'];

/**
 * Reads a voter CSV. Headers are matched loosely ("Email", "email_address",
 * "Full Name", "name", or separate "First Name"/"Last Name" columns).
 */
export class CsvVoterParser {
  static readonly MAX_ROWS = 10_000;

  static parse(content: string): ParsedVoters {
    let records: Record<string, string>[];
    try {
      records = parse(content, {
        bom: true,
        columns: (headers: string[]) =>
          headers.map(CsvVoterParser.normalizeHeader),
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      }) as Record<string, string>[];
    } catch (error) {
      throw new CsvFormatError(
        `Could not read the CSV file: ${(error as Error).message}`,
      );
    }

    if (records.length === 0)
      throw new CsvFormatError('The CSV file has no voter rows');
    if (records.length > CsvVoterParser.MAX_ROWS) {
      throw new CsvFormatError(
        `The CSV file has more than ${CsvVoterParser.MAX_ROWS} rows`,
      );
    }

    const headers = Object.keys(records[0]);
    const emailKey = EMAIL_HEADERS.find((key) => headers.includes(key));
    if (!emailKey)
      throw new CsvFormatError('The CSV file needs an "email" column');

    const voters: VoterInput[] = [];
    const errors: RowError[] = [];
    const seen = new Set<string>();

    records.forEach((record, index) => {
      const row = index + 2;
      const email = (record[emailKey] ?? '').trim().toLowerCase();
      if (!email)
        return errors.push({ row, email: '', reason: 'Missing email' });
      if (!isEmail(email) || email.length > 255)
        return errors.push({ row, email, reason: 'Invalid email' });
      if (seen.has(email))
        return errors.push({ row, email, reason: 'Duplicate email in file' });
      seen.add(email);

      const fullName = CsvVoterParser.readName(record);
      voters.push(fullName ? { email, fullName } : { email });
    });

    return { voters, errors };
  }

  private static readName(record: Record<string, string>): string | undefined {
    const direct = NAME_HEADERS.map((key) => record[key]).find((value) =>
      value?.trim(),
    );
    const combined = [record.firstname, record.lastname]
      .filter((part) => part?.trim())
      .join(' ');
    const name = (direct ?? combined).trim();
    return name ? name.slice(0, 255) : undefined;
  }

  private static normalizeHeader(header: string): string {
    return header.toLowerCase().replace(/[^a-z]/g, '');
  }
}

export class CsvFormatError extends Error {}
