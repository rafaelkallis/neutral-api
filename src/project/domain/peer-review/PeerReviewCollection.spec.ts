import { PeerReviewCollection } from 'project/domain/peer-review/PeerReviewCollection';
import { ModelFaker } from 'test/ModelFaker';
import { Project } from 'project/domain/project/Project';

describe(PeerReviewCollection.name, () => {
  let peerReviewCollection: PeerReviewCollection;
  let project: Project;
  let modelFaker: ModelFaker;

  beforeEach(() => {
    modelFaker = new ModelFaker();
    const creator = modelFaker.user();
    project = modelFaker.project(creator.id);
    project.roles.add(modelFaker.role());
    project.roles.add(modelFaker.role());
    project.roles.add(modelFaker.role());
    project.reviewTopics.add(modelFaker.reviewTopic());
    project.reviewTopics.add(modelFaker.reviewTopic());
    project.reviewTopics.add(modelFaker.reviewTopic());
    peerReviewCollection = new PeerReviewCollection([]);
    project.peerReviews = peerReviewCollection;
  });

  test.todo('whereSenderRole');
  test.todo('whereReceiverRole');
  test.todo('whereReviewTopic');
});
