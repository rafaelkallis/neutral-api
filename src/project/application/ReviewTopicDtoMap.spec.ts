import { User } from 'user/domain/User';
import { Project } from 'project/domain/project/Project';
import { Consensuality } from 'project/domain/project/value-objects/Consensuality';
import { ReviewTopicDtoMap } from './ReviewTopicDtoMap';
import { UnitTestScenario } from 'test/UnitTestScenario';
import { ReviewTopic } from 'project/domain/review-topic/ReviewTopic';

describe(ReviewTopicDtoMap.name, () => {
  let scenario: UnitTestScenario<ReviewTopicDtoMap>;
  let reviewTopicDtoMap: ReviewTopicDtoMap;
  let creator: User;
  let project: Project;
  let authUser: User;
  let reviewTopic: ReviewTopic;

  beforeEach(async () => {
    scenario = await UnitTestScenario.builder(ReviewTopicDtoMap).build();
    reviewTopicDtoMap = scenario.subject;
    creator = scenario.modelFaker.user();
    project = scenario.modelFaker.project(creator.id);
    authUser = creator;
    reviewTopic = scenario.modelFaker.reviewTopic();
    reviewTopic.consensuality = Consensuality.from(1);
  });

  test('general', () => {
    const reviewTopicDto = reviewTopicDtoMap.map(reviewTopic, {
      project,
      authUser,
    });
    expect(reviewTopicDto).toEqual({
      id: reviewTopic.id.value,
      title: reviewTopic.title.value,
      description: reviewTopic.description.value,
      consensuality: reviewTopic.consensuality?.value,
      createdAt: reviewTopic.createdAt.value,
      updatedAt: reviewTopic.updatedAt.value,
    });
  });

  test('when auth user is project creator, should expose consensuality', () => {
    const reviewTopicDto = reviewTopicDtoMap.map(reviewTopic, {
      project,
      authUser,
    });
    expect(reviewTopicDto.consensuality).toBeTruthy();
  });

  test('when auth user is not project creator, should not expose consensuality', () => {
    authUser = scenario.modelFaker.user();
    const reviewTopicDto = reviewTopicDtoMap.map(reviewTopic, {
      project,
      authUser,
    });
    expect(reviewTopicDto.consensuality).toBeNull();
  });
});
