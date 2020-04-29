import { PrimitiveFaker } from 'test/PrimitiveFaker';
import { RoleTitle } from 'project/domain/role/value-objects/RoleTitle';
import { RoleDescription } from 'project/domain/role/value-objects/RoleDescription';

export class ValueObjectFaker {
  private readonly primitiveFaker: PrimitiveFaker;

  public constructor(primitiveFaker: PrimitiveFaker) {
    this.primitiveFaker = primitiveFaker;
  }

  public roleTitle(): RoleTitle {
    return RoleTitle.from(this.primitiveFaker.words());
  }

  public roleDescription(): RoleDescription {
    return RoleDescription.from(this.primitiveFaker.paragraph());
  }
}
