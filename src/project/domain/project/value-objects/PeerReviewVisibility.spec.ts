/* eslint-disable complexity */
import { PeerReviewVisibility } from './PeerReviewVisibility';
import { ModelFaker } from 'test/ModelFaker';
import { ProjectTestHelper } from 'test/ProjectTestHelper';
import { ReadonlyUser, User } from 'user/domain/User';
import { Project } from '../Project';
import { ReadonlyReviewTopic } from 'project/domain/review-topic/ReviewTopic';
import { ReadonlyRole } from 'project/domain/role/Role';
import { MilestoneState } from 'project/domain/milestone/value-objects/states/MilestoneState';
import { CancelledMilestoneState } from 'project/domain/milestone/value-objects/states/CancelledMilestoneState';
import { PeerReviewMilestoneState } from 'project/domain/milestone/value-objects/states/PeerReviewMilestoneState';
import { ManagerReviewMilestoneState } from 'project/domain/milestone/value-objects/states/ManagerReviewMilestoneState';
import { FinishedMilestoneState } from 'project/domain/milestone/value-objects/states/FinishedMilestoneState';

describe('' + PeerReviewVisibility.name, () => {
  const modelFaker = new ModelFaker();
  const { PUBLIC, PROJECT, MANAGER, SELF } = PeerReviewVisibility;
  const allVisibilities = [PUBLIC, PROJECT, MANAGER, SELF];

  const CANCELLED = CancelledMilestoneState.INSTANCE;
  const PEER_REVIEW = PeerReviewMilestoneState.INSTANCE;
  const MANAGER_REVIEW = ManagerReviewMilestoneState.INSTANCE;
  const FINISHED = FinishedMilestoneState.INSTANCE;
  const allStates = [CANCELLED, PEER_REVIEW, MANAGER_REVIEW, FINISHED];

  const sender = 'sender';
  const manager = 'manager';
  const peer = 'peer';
  const outsider = 'outsider';

  let project: Project;
  let projectHelper: ProjectTestHelper;

  let managerUser: User;
  let senderUser: User;
  let receiverUser: User;
  let outsiderUser: User;
  let peerUsers: User[];
  let reviewTopic: ReadonlyReviewTopic;

  let senderRole: ReadonlyRole;
  let managerRole: ReadonlyRole;

  beforeEach(() => {
    managerUser = modelFaker.user();
    senderUser = modelFaker.user();
    receiverUser = modelFaker.user();
    peerUsers = [senderUser, receiverUser, managerUser];
    projectHelper = ProjectTestHelper.ofCreator(managerUser);
    project = projectHelper.project;
    reviewTopic = projectHelper.addReviewTopic();
    const roles = peerUsers.map((u) => projectHelper.addRoleAndAssign(u));
    senderRole = roles[0];
    managerRole = roles[2];
    outsiderUser = modelFaker.user();
  });

  const cases: [PeerReviewVisibility, MilestoneState, string, boolean][] = [
    // positive tests
    ...cartesianProduct(
      // 16 cases
      allVisibilities,
      allStates,
      [sender],
      true,
    ),
    ...cartesianProduct(
      // 6 cases
      [MANAGER, PROJECT, PUBLIC],
      [MANAGER_REVIEW, FINISHED],
      [manager],
      true,
    ),
    ...cartesianProduct(
      // 2 cases
      [PROJECT, PUBLIC],
      [FINISHED],
      [peer],
      true,
    ),
    ...cartesianProduct(
      // 2 cases
      [PUBLIC],
      [FINISHED],
      [outsider],
      true,
    ),
    // negative cases
    ...cartesianProduct(
      // 4 cases
      [SELF],
      allStates,
      [manager],
      false,
    ),
    ...cartesianProduct(
      // 8 cases
      allVisibilities,
      [CANCELLED, PEER_REVIEW],
      [manager],
      false,
    ),
    ...cartesianProduct(
      // 12 cases
      allVisibilities,
      [CANCELLED, PEER_REVIEW, MANAGER_REVIEW],
      [peer],
      false,
    ),
    ...cartesianProduct(
      // 2 cases
      [SELF, MANAGER],
      [FINISHED],
      [peer],
      false,
    ),
    ...cartesianProduct(
      // 12 cases
      allVisibilities,
      [CANCELLED, PEER_REVIEW, MANAGER_REVIEW],
      [outsider],
      false,
    ),
    ...cartesianProduct(
      // 3 cases
      [SELF, MANAGER, PROJECT],
      [FINISHED],
      [outsider],
      false,
    ),

    // ...cartesianProduct(
    //   // 12 cases
    //   [SELF],
    //   allStates,
    //   [manager, peer, outsider],
    //   false,
    // ),
    // ...cartesianProduct(
    //   // 8 cases
    //   [MANAGER],
    //   allStates,
    //   [peer, outsider],
    //   false,
    // ),
    // ...cartesianProduct(
    //   // 8 cases
    //   [MANAGER],
    //   [PEER_REVIEW],
    //   [manager],
    //   false,
    // ),
    // ...cartesianProduct(
    //   // 4 cases
    //   [PROJECT],
    //   allStates,
    //   [outsider],
    //   false,
    // ),
    // ...cartesianProduct(
    //   // 2 cases
    //   [PROJECT],
    //   [PEER_REVIEW, MANAGER_REVIEW],
    //   [peer],
    //   false,
    // ),
    // ...cartesianProduct(
    //   // 1 cases
    //   [PROJECT],
    //   [PEER_REVIEW],
    //   [manager],
    //   false,
    // ),
    // ...cartesianProduct(
    //   // 4 cases
    //   [PUBLIC],
    //   [PEER_REVIEW, MANAGER_REVIEW],
    //   [peer, outsider],
    //   false,
    // ),
    // ...cartesianProduct(
    //   // 1 cases
    //   [PUBLIC],
    //   [PEER_REVIEW],
    //   [manager],
    //   false,
    // ),
  ];

  test.each(cases)(
    'isVisible(%s, %s, %s) = %s',
    async (peerReviewVisibility, state, role, isVisible) => {
      project.update({ peerReviewVisibility });
      project.finishFormation();
      projectHelper.addMilestone();
      const [
        peerReview,
      ] = await projectHelper.submitPeerReviewsForSenderAndReviewTopic(
        senderRole,
        reviewTopic,
      );

      if (state.compareTo(CANCELLED) === 0) {
        project.latestMilestone.cancel();
      }
      if (
        state.compareTo(MANAGER_REVIEW) >= 0 &&
        project.latestMilestone.state.equals(PEER_REVIEW)
      ) {
        await projectHelper.completePeerReviews();
      }
      if (
        state.compareTo(FINISHED) >= 0 &&
        project.latestMilestone.state.equals(MANAGER_REVIEW)
      ) {
        project.submitManagerReview();
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

  test.each(allVisibilities)(
    'manager sender during peer review should be visible',
    async (peerReviewVisibility) => {
      project.update({ peerReviewVisibility });
      project.finishFormation();
      projectHelper.addMilestone();
      const [
        peerReview,
      ] = await projectHelper.submitPeerReviewsForSenderAndReviewTopic(
        managerRole,
        reviewTopic,
      );
      expect(
        project.peerReviewVisibility.isVisible(
          peerReview.id,
          project,
          managerUser,
        ),
      ).toEqual(true);
    },
  );
});

function cartesianProduct(
  visibilities: PeerReviewVisibility[],
  states: MilestoneState[],
  roles: string[],
  isVisible: boolean,
): [PeerReviewVisibility, MilestoneState, string, boolean][] {
  const result: [PeerReviewVisibility, MilestoneState, string, boolean][] = [];
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
