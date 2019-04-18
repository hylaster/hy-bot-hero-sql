import { InMemoryDataService } from '../../../src/data/in-memory-implementation/in-memory-data-service';
import { DataServiceTester } from '../data-service-tester';

describe(nameof<InMemoryDataService>(), () => {
  const tester = new DataServiceTester(() => new InMemoryDataService());
  tester.execute();
});
