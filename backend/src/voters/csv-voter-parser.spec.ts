import { CsvFormatError, CsvVoterParser } from './csv-voter-parser.js';

describe('CsvVoterParser', () => {
  it('matches headers loosely and lower-cases emails', () => {
    const { voters, errors } = CsvVoterParser.parse(
      '﻿Email Address,Full Name\nAda@Example.com,Ada Lovelace\nbob@example.com,\n',
    );
    expect(errors).toEqual([]);
    expect(voters).toEqual([
      { email: 'ada@example.com', fullName: 'Ada Lovelace' },
      { email: 'bob@example.com' },
    ]);
  });

  it('combines first and last name columns', () => {
    const { voters } = CsvVoterParser.parse(
      'email,first_name,last_name\nalan@example.com,Alan,Turing\n',
    );
    expect(voters).toEqual([
      { email: 'alan@example.com', fullName: 'Alan Turing' },
    ]);
  });

  it('reports bad and duplicate rows with their line numbers', () => {
    const { voters, errors } = CsvVoterParser.parse(
      'email\nok@example.com\nnot-an-email\n\nOK@example.com\n,\n',
    );
    expect(voters).toHaveLength(1);
    expect(errors).toEqual([
      { row: 3, email: 'not-an-email', reason: 'Invalid email' },
      { row: 4, email: 'ok@example.com', reason: 'Duplicate email in file' },
      { row: 5, email: '', reason: 'Missing email' },
    ]);
  });

  it('requires an email column', () => {
    expect(() => CsvVoterParser.parse('name\nAda\n')).toThrow(CsvFormatError);
  });

  it('rejects an empty file', () => {
    expect(() => CsvVoterParser.parse('email\n')).toThrow(/no voter rows/);
  });
});
