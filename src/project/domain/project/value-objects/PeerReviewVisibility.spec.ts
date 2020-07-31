/* eslint-disable complexity */
import { PeerReviewVisibility } from './PeerReviewVisibility';
import { PeerReviewProjectState } from './states/PeerReviewProjectState';
import { ManagerReviewProjectState } from './states/ManagerReviewProjectState';
import { FinishedProjectState } from './states/FinishedProjectState';
import { ArchivedProjectState } from './states/ArchivedProjectState';
import { ProjectState } from './states/ProjectState';
import { CancelledProjectState } from './states/CancelledProjectState';
import { ModelFaker } from 'test/ModelFaker';
import { OrdinalProjectState } from './states/OrdinalProjectState';
import { ProjectTestHelper } from 'test/ProjectTestHelper';
import { ReadonlyUser } from 'user/domain/User';
import { UserCollection } from 'user/domain/UserCollection';

describe(PeerReviewVisibility.name, () => {
  const modelFaker = new ModelFaker();
  const { PUBLIC, PROJECT, MANAGER, SELF } = PeerReviewVisibility;
  const allVisibilities = [PUBLIC, PROJECT, MANAGER, SELF];

  const PEER_REVIEW = PeerReviewProjectState.INSTANCE;
  const MANAGER_REVIEW = ManagerReviewProjectState.INSTANCE;
  const FINISHED = FinishedProjectState.INSTANCE;
  const ARCHIVED = ArchivedProjectState.INSTANCE;
  const allStates = [PEER_REVIEW, MANAGER_REVIEW, FINISHED, ARCHIVED];
  const CANCELLED = CancelledProjectState.INSTANCE;

  const sender = 'sender';
  const manager = 'manager';
  const peer = 'peer';
  const outsider = 'outsider';
  // const allRoles = [sender, manager, peer, outsider];

  const cases: [PeerReviewVisibility, ProjectState, string, boolean][] = [
    // positive tests
    ...cartesianProduct(
      // 16 cases
      allVisibilities,
      allStates,
      [sender],
      true,
    ),
    ...cartesianProduct(
      // 9 cases
      [MANAGER, PROJECT, PUBLIC],
      [MANAGER_REVIEW, FINISHED, ARCHIVED],
      [manager],
      true,
    ),
    ...cartesianProduct(
      // 4 cases
      [PROJECT, PUBLIC],
      [FINISHED, ARCHIVED],
      [peer],
      true,
    ),
    ...cartesianProduct(
      // 2 cases
      [PUBLIC],
      [FINISHED, ARCHIVED],
      [outsider],
      true,
    ),
    // negative cases
    ...cartesianProduct(
      // 12 cases
      [SELF],
      allStates,
      [manager, peer, outsider],
      false,
    ),
    ...cartesianProduct(
      // 8 cases
      [MANAGER],
      allStates,
      [peer, outsider],
      false,
    ),
    ...cartesianProduct(
      // 8 cases
      [MANAGER],
      [PEER_REVIEW],
      [manager],
      false,
    ),
    ...cartesianProduct(
      // 4 cases
      [PROJECT],
      allStates,
      [outsider],
      false,
    ),
    ...cartesianProduct(
      // 2 cases
      [PROJECT],
      [PEER_REVIEW, MANAGER_REVIEW],
      [peer],
      false,
    ),
    ...cartesianProduct(
      // 1 cases
      [PROJECT],
      [PEER_REVIEW],
      [manager],
      false,
    ),
    ...cartesianProduct(
      // 4 cases
      [PUBLIC],
      [PEER_REVIEW, MANAGER_REVIEW],
      [peer, outsider],
      false,
    ),
    ...cartesianProduct(
      // 1 cases
      [PUBLIC],
      [PEER_REVIEW],
      [manager],
      false,
    ),
  ];

  test.each(cases)(
    'isVisible(%s, %s, %s) = %s',
    (peerReviewVisibility, state, role, isVisible) => {
      const managerUser = modelFaker.user();
      const senderUser = modelFaker.user();
      const receiverUser = modelFaker.user();
      const peerUsers = [senderUser, receiverUser, managerUser];
      const helper = ProjectTestHelper.ofCreator(managerUser);
      const reviewTopic = helper.addReviewTopic();
      const roles = peerUsers.map((u) => helper.addRoleAndAssign(u));
      const [senderRole] = roles;
      const outsiderUser = modelFaker.user();
      const { project } = helper;
      project.update(undefined, undefined, peerReviewVisibility);
      project.finishFormation(new UserCollection(peerUsers));
      const [peerReview] = helper.submitPeerReviewsForSenderAndReviewTopic(
        senderRole,
        reviewTopic,
      );
      if (state instanceof OrdinalProjectState) {
        if (
          state.isGreaterEqualsThan(PEER_REVIEW) &&
          project.state.equals(PEER_REVIEW)
        ) {
          helper.completePeerReviews();
        }
        if (
          state.isGreaterEqualsThan(MANAGER_REVIEW) &&
          project.state.equals(MANAGER_REVIEW)
        ) {
          project.submitManagerReview();
        }
        if (
          state.isGreaterEqualsThan(FINISHED) &&
          project.state.equals(FINISHED)
        ) {
          project.archive();
        }
      } else if (state.equals(CANCELLED)) {
        project.cancel();
      }
      expect(
        project.peerReviewVisibility.isVisible(
          peerReview.id,
          project,
          getUser(role),
        ),
      ).toEqual(isVisible);

      function getUser(role: string): ReadonlyUser {
        switch (role) {
          case 'sender':
            return senderUser;
          case 'manager':
            return managerUser;
          case 'peer':
            return receiverUser;
          case 'outsider':
            return outsiderUser;
          default:
            throw new Error();
        }
      }
    },
  );
});

function cartesianProduct(
  visibilities: PeerReviewVisibility[],
  states: ProjectState[],
  roles: string[],
  isVisible: boolean,
): [PeerReviewVisibility, ProjectState, string, boolean][] {
  const result: [PeerReviewVisibility, ProjectState, string, boolean][] = [];
  for (const v of visibilities) {
    for (const s of states) {
      for (const r of roles) {
        result.push([v, s, r, isVisible]);
      }
    }
  }
  return result;
}

// function notEq<T>(...as: T[]) {
//   return (b: T): boolean => as.every((a) => a !== b);
// }
