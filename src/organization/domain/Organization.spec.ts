import { User } from 'user/domain/User';
import { ModelFaker } from 'test/ModelFaker';
import { Organization } from './Organization';

describe(Organization, () => {
  let modelFaker: ModelFaker;
  let owner: User;
  let organization: Organization;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    owner = modelFaker.user();
    organization = modelFaker.organization(owner.id);
  });

  test('assert owner', () => {
    expect(() => organization.assertOwner(owner.id)).not.toThrowError();
    const user = modelFaker.user();
    expect(() => organization.assertOwner(user.id)).toThrowError();
  });
});
