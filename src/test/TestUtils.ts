import { PrimitiveFaker } from 'test/fakers/PrimitiveFaker';
import { ModelFaker } from 'test/fakers/ModelFaker';

export class TestUtils {
  /**
   *
   */
  public static readonly primitiveFaker = new PrimitiveFaker();

  /**
   *
   */
  public static readonly modelFaker = new ModelFaker(TestUtils.primitiveFaker);

  /**
   *
   */
  public static async sleep(millis: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, millis));
  }
}
