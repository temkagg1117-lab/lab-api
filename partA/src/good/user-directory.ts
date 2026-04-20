export interface User {
  id: string;
  email: string;
  name: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUser {
  id: string;
  email: string;
  name: string;
}

export interface UserPatch {
  email?: string;
  name?: string;
}

export interface UserSearchCriteria {
  text?: string;
  includeDeleted?: boolean;
}

export class UserDirectoryError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "UserDirectoryError";
  }
}

export class UserNotFoundError extends UserDirectoryError {
  public constructor(identifier: string) {
    super(`User not found: ${identifier}`);
    this.name = "UserNotFoundError";
  }
}

export class DuplicateUserError extends UserDirectoryError {
  public constructor(email: string) {
    super(`A user with email "${email}" already exists`);
    this.name = "DuplicateUserError";
  }
}

export interface UserDirectory {
  createUser(input: NewUser): User;
  updateUser(id: string, patch: UserPatch): User;
  deleteUser(id: string): void;
  restoreUser(id: string): void;
  getUserById(id: string): User;
  getUserByEmail(email: string): User;
  searchUsers(criteria: UserSearchCriteria): User[];
}

class InMemoryUserDirectory implements UserDirectory {
  readonly #users = new Map<string, User>();

  readonly #emailIndex = new Map<string, string>();

  public createUser(input: NewUser): User {
    if (this.#emailIndex.has(input.email)) {
      throw new DuplicateUserError(input.email);
    }

    const now = new Date();
    const user: User = {
      id: input.id,
      email: input.email,
      name: input.name,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    this.#users.set(user.id, user);
    this.#emailIndex.set(user.email, user.id);
    return this.#clone(user);
  }

  public updateUser(id: string, patch: UserPatch): User {
    const existing = this.#requireUser(id);

    if (patch.email !== undefined && patch.email !== existing.email) {
      if (this.#emailIndex.has(patch.email)) {
        throw new DuplicateUserError(patch.email);
      }

      this.#emailIndex.delete(existing.email);
      this.#emailIndex.set(patch.email, existing.id);
      existing.email = patch.email;
    }

    if (patch.name !== undefined) {
      existing.name = patch.name;
    }

    existing.updatedAt = new Date();
    return this.#clone(existing);
  }

  public deleteUser(id: string): void {
    const user = this.#requireUser(id);
    user.isDeleted = true;
    user.updatedAt = new Date();
  }

  public restoreUser(id: string): void {
    const user = this.#requireUser(id);
    user.isDeleted = false;
    user.updatedAt = new Date();
  }

  public getUserById(id: string): User {
    return this.#clone(this.#requireUser(id));
  }

  public getUserByEmail(email: string): User {
    const id = this.#emailIndex.get(email);
    if (id === undefined) {
      throw new UserNotFoundError(email);
    }

    return this.getUserById(id);
  }

  public searchUsers(criteria: UserSearchCriteria): User[] {
    const normalizedText = criteria.text?.trim().toLowerCase();

    return [...this.#users.values()]
      .filter((user) => criteria.includeDeleted || !user.isDeleted)
      .filter((user) => {
        if (!normalizedText) {
          return true;
        }

        return user.name.toLowerCase().includes(normalizedText)
          || user.email.toLowerCase().includes(normalizedText)
          || user.id.toLowerCase().includes(normalizedText);
      })
      .map((user) => this.#clone(user));
  }

  #requireUser(id: string): User {
    const user = this.#users.get(id);
    if (user === undefined) {
      throw new UserNotFoundError(id);
    }

    return user;
  }

  #clone(user: User): User {
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    };
  }
}

export function createUserDirectory(): UserDirectory {
  return new InMemoryUserDirectory();
}
