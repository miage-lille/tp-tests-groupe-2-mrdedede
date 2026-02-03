// Tests unitaires

import { testUser } from "src/users/tests/user-seeds";
import { InMemoryWebinarRepository } from "../adapters/webinar-repository.in-memory";
import { Webinar } from "../entities/webinar.entity";
import { ChangeSeats } from "./change-seats";


describe('Feature : Change seats', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let useCase: ChangeSeats;

  const webinar = new Webinar({
      id: 'webinar-id',
      organizerId: testUser.alice.props.id,
      title: 'Webinar title',
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-01T01:00:00Z'),
      seats: 100,
  });

  beforeEach(() => {
      webinarRepository = new InMemoryWebinarRepository([webinar]);
      useCase = new ChangeSeats(webinarRepository);
  });
  // Initialisation de nos tests, boilerplates...
  describe('Scenario: happy path', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 200,
    };
    it('should change the number of seats for a webinar', async () => {
      // ACT
      await useCase.execute(payload);
      // ASSERT
      const updatedWebinar = await webinarRepository.findById('webinar-id');
      expect(updatedWebinar?.props.seats).toEqual(200);
    });
  });

  describe('Scenario: webinar does not exist', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-2',
      seats: 200,
    };
    it('should fail', async () => {
      // ACT
      let promise = useCase.execute(payload)
      // ASSERT
      expect(promise).rejects.toThrow("Webinar not found");
    });
  });

  describe('Scenario: update the webinar of someone else', () => {
    const payload = {
      user: testUser.bob,
      webinarId: 'webinar-id',
      seats: 200,
    };
    it('should fail', async () => {
      // ACT
      let promise = useCase.execute(payload)
      // ASSERT
      expect(promise).rejects.toThrow("User is not allowed to update this webinar");
    });
    it('should remain unchanged', async () => {
      const webinar = webinarRepository.findByIdSync('webinar-id');
      expect(webinar?.props.seats).toEqual(100);
    })
  });

  describe('Scenario: change seat to an inferior number', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 50,
    };
    it('should fail', async () => {
      // ACT
      let promise = useCase.execute(payload)
      // ASSERT
      expect(promise).rejects.toThrow("You cannot reduce the number of seats");
    });
    it('should remain unchanged', async () => {
      const webinar = webinarRepository.findByIdSync('webinar-id');
      expect(webinar?.props.seats).toEqual(100);
    });
  });

  describe('Scenario: change seat to a number > 1000', () => {
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 1001,
    };
    it('should fail', async () => {
      // ACT
      let promise = useCase.execute(payload)
      // ASSERT
      expect(promise).rejects.toThrow("Webinar must have at most 1000 seats");
    });
    it('should remain unchanged', async () => {
      const webinar = webinarRepository.findByIdSync('webinar-id');
      expect(webinar?.props.seats).toEqual(100);
    });
  });
});