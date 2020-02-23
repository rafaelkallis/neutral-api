export class Guard {
  private readonly value: unknown;
  private readonly checks: GuardCheck[];

  protected constructor(value: unknown) {
    this.value = value;
    this.checks = [];
  }

  public get(): unknown {
    for (const check of this.checks) {
      if (!check.check(this.value)) {
        throw new Error();
      }
    }
    return this.value;
  }

  public static for(value: unknown): Guard {
    return new Guard(value);
  }

  public string(): Guard {
    this.checks.push(new StringGuardCheck());
    return this;
  }

  public maxLength(maxLength: number): Guard {
    this.checks.push(new MaxLengthGuardCheck(maxLength));
    return this;
  }

  public minLength(minLength: number): Guard {
    this.checks.push(new MinLengthGuardCheck(minLength));
    return this;
  }
}

abstract class GuardCheck {
  public abstract check(value: unknown): boolean;
}

class MaxLengthGuardCheck extends GuardCheck {
  public constructor(private readonly maxLength: number) {
    super();
  }
  public check(value: unknown): boolean {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length <= this.maxLength;
    }
    return false;
  }
}

class MinLengthGuardCheck extends GuardCheck {
  public constructor(private readonly minLength: number) {
    super();
  }
  public check(value: unknown): boolean {
    if (typeof value === 'string' || Array.isArray(value)) {
      return value.length >= this.minLength;
    }
    return false;
  }
}

class StringGuardCheck extends GuardCheck {
  public check(value: unknown): boolean {
    return typeof value === 'string';
  }
}
