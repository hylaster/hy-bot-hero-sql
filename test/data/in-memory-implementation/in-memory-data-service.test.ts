import { InMemoryEloDataService } from '../../../src/data/in-memory-implementation/in-memory-data-service';
import { DataServiceTester } from '../data-service-tester';

describe(nameof<InMemoryEloDataService>(), () => {
  const tester = new DataServiceTester(() => new InMemoryEloDataService());
  tester.execute();
});
