import { Test } from '@nestjs/testing';

import { ProjectState } from '../../common';
import { ProjectStateTransitionValidationService } from './project-state-transition-validation.service';

describe('ModelService', () => {
  const { FORMATION, PEER_REVIEW, FINISHED } = ProjectState;

  let projectStateTransitionValidationService: ProjectStateTransitionValidationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProjectStateTransitionValidationService],
    }).compile();

    projectStateTransitionValidationService = module.get(
      ProjectStateTransitionValidationService,
    );
  });

  test('should be defined', () => {
    expect(projectStateTransitionValidationService).toBeDefined();
  });

  test.each([[FORMATION], [PEER_REVIEW], [FINISHED]])(
    'self loops are allowed',
    state => {
      expect(() =>
        projectStateTransitionValidationService.validateTransition(
          state,
          state,
        ),
      ).not.toThrow();
    },
  );

  test.each([[FORMATION, PEER_REVIEW], [PEER_REVIEW, FINISHED]])(
    'valid transitions',
    (oldState, newState) => {
      expect(() =>
        projectStateTransitionValidationService.validateTransition(
          oldState,
          newState,
        ),
      ).not.toThrow();
    },
  );

  test.each([
    [PEER_REVIEW, FORMATION],
    [FINISHED, PEER_REVIEW],
    [FINISHED, FORMATION],
    [FORMATION, FINISHED],
  ])('invalid transitions', (oldState, newState) => {
    expect(() =>
      projectStateTransitionValidationService.validateTransition(
        oldState,
        newState,
      ),
    ).toThrow();
  });
});
