import { User } from '../users/user.entity.js';
import { Election } from '../elections/entities/election.entity.js';
import { Position } from '../elections/entities/position.entity.js';
import { Candidate } from '../elections/entities/candidate.entity.js';
import { EmailTemplate } from '../elections/entities/email-template.entity.js';
import { Voter } from '../voters/entities/voter.entity.js';
import { Vote } from '../voting/entities/vote.entity.js';

/** Every entity, listed once for both the app and the TypeORM CLI. */
export const ENTITIES = [
  User,
  Election,
  Position,
  Candidate,
  EmailTemplate,
  Voter,
  Vote,
];
