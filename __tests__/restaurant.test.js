const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService.js');

const mockUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: '12345',
};

describe('Restaurant routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  afterAll(() => {
    pool.end();
  });

  it('/api/v1/restaurants should return a list of restaurants', async () => {
    const res = await request(app).get('/api/v1/restaurants');
    expect(res.status).toBe(200);
    expect(res.body).toMatchInlineSnapshot(`
      Array [
        Object {
          "cost": 1,
          "cuisine": "American",
          "id": "1",
          "image": "https://media-cdn.tripadvisor.com/media/photo-o/05/dd/53/67/an-assortment-of-donuts.jpg",
          "name": "Pip's Original",
          "website": "http://www.PipsOriginal.com",
        },
        Object {
          "cost": 3,
          "cuisine": "Italian",
          "id": "2",
          "image": "https://media-cdn.tripadvisor.com/media/photo-m/1280/13/af/df/89/duck.jpg",
          "name": "Mucca Osteria",
          "website": "http://www.muccaosteria.com",
        },
        Object {
          "cost": 2,
          "cuisine": "Mediterranean",
          "id": "3",
          "image": "https://media-cdn.tripadvisor.com/media/photo-m/1280/1c/f2/e5/0c/dinner.jpg",
          "name": "Mediterranean Exploration Company",
          "website": "http://www.mediterraneanexplorationcompany.com/",
        },
        Object {
          "cost": 2,
          "cuisine": "American",
          "id": "4",
          "image": "https://media-cdn.tripadvisor.com/media/photo-o/0d/d6/a1/06/chocolate-gooey-brownie.jpg",
          "name": "Salt & Straw",
          "website": "https://saltandstraw.com/pages/nw-23",
        },
      ]
    `);
  });

  it('GET api/v1/restaurants/:restId returns restaurant detail with nested reviews', async () => {
    const res = await request(app).get('/api/v1/restaurants/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchInlineSnapshot(`
      Object {
        "cost": 1,
        "cuisine": "American",
        "id": "1",
        "image": "https://media-cdn.tripadvisor.com/media/photo-o/05/dd/53/67/an-assortment-of-donuts.jpg",
        "name": "Pip's Original",
        "reviews": Array [
          Object {
            "detail": "Best restaurant ever!",
            "id": "1",
            "restaurant_id": "1",
            "stars": 5,
            "user_id": "1",
          },
          Object {
            "detail": "Terrible service :(",
            "id": "2",
            "restaurant_id": "1",
            "stars": 1,
            "user_id": "2",
          },
          Object {
            "detail": "It was fine.",
            "id": "3",
            "restaurant_id": "1",
            "stars": 4,
            "user_id": "3",
          },
        ],
        "website": "http://www.PipsOriginal.com",
      }
    `);
  });

  const registerAndLogin = async () => {
    const agent = request.agent(app);
    const user = await UserService.create(mockUser);
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: mockUser.email, password: mockUser.password });
    return [agent, user];
  };

  it('POST /api/v1/restaurants/:id/reviews should create a new review when user is logged in', async () => {
    const [agent] = await registerAndLogin();
    const res = await agent.post('/api/v1/restaurants/1/reviews').send({
      stars: 1,
      detail: 'This place was horrendous, food was disgusting.',
    });
    expect(res.status).toBe(200);
    expect(res.body).toMatchInlineSnapshot(`
      Object {
        "detail": "This place was horrendous, food was disgusting.",
        "id": "4",
        "restaurant_id": "1",
        "stars": 1,
        "user_id": "4",
      }
    `);
  });

  it('DELETE /api/v1/reviews/:id admin can delete a reviews', async () => {
    const agent = request.agent(app);
    // making an admin
    await UserService.create({
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin@admin.com',
      password: 'password',
    });
    //logged in as an admin
    await agent.post('/api/v1/users/sessions').send({
      email: 'admin@admin.com',
      password: 'password',
    });
    // deleting review with id = 1
    const res = await agent.delete('/api/v1/reviews/2');
    expect(res.status).toBe(204);

    // if 404/not found that means it's deleted
    const getResp = await request(app).get('/api/v1/reviews/2');
    expect(getResp.status).toBe(404);
  });

  it('DELETE /api/v1/reviews/:id users can delete their reviews', async () => {
    const agent = request.agent(app);
    await UserService.create({
      firstName: 'Test',
      lastName: 'Test',
      email: 'Test@Test.com',
      password: 'password',
    });
    await agent.post('/api/v1/users/sessions').send({
      email: 'Test@Test.com',
      password: 'password',
    });

    await agent.post('/api/v1/restaurants/1/reviews').send({
      stars: 1,
      detail:
        'you know what, Ive had it with this place, horrible food, terrible staff, and disgusting lighting',
    });
    const res = await agent.delete('/api/v1/reviews/4');
    expect(res.status).toBe(204);

    const getResp = await request(app).get('/api/v1/reviews/1');
    expect(getResp.status).toBe(404);
  });
});
