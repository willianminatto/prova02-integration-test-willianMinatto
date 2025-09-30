import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker';
import { SimpleReporter } from '../simple-reporter';

beforeAll(() => pactum.reporter.add(SimpleReporter));
afterAll(() => pactum.reporter.end());

describe('Basic integration tests restful-api.dev /objects', () => {
  const baseUrl = 'https://api.restful-api.dev';
  const endpoint = '/objects';

  it('GET /objects — Deve retornar lista', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}`)
      .expectStatus(StatusCodes.OK);
  });

  it('GET /objects/:id — Deve retornar o item', async () => {
    const fakeObj = {
      name: faker.commerce.productName(),
      data: {
        price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
        color: faker.color.human(),
      },
    };

    const created = await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(fakeObj)
      .expectStatus(StatusCodes.OK)
      .toss();

    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}/${created.body.id}`)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        id: created.body.id,
        name: created.body.name,
        data: {
          color: created.body.data.color,
          price: created.body.data.price,
        },
      });
  });

  it('GET /objects/:id — deve retornar 404 se não existir', async () => {
    const fakeId = 'non-existent-id-123456';

    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}/${fakeId}`)
      .expectStatus(StatusCodes.NOT_FOUND);
  });

  it('POST /objects — deve criar objeto e receber 200', async () => {
    const fakeObj = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
      },
    };

    await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(fakeObj)
      .expectStatus(StatusCodes.OK);
  });

  it('POST /objects — deve ignorar campos desconhecidos no corpo', async () => {
    const fakeObj = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        price: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
      },
      owner: faker.person.fullName(),
      timestamp: new Date().toISOString(),
    };

    const res = await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(fakeObj)
      .expectStatus(StatusCodes.OK)
      .toss();

    expect(res.body).not.toHaveProperty('owner');
    expect(res.body).not.toHaveProperty('timestamp');
  });

  it('POST /objects — deve falhar com dados inválidos (price negativo)', async () => {
    const invalidObj = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        price: -100.0,
      },
    };

    const res = await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(invalidObj)
      .expectStatus(StatusCodes.BAD_REQUEST)
      .toss();

    console.log('Resposta price negativo:', res.body);
  });

  it('PATCH /objects/:id — deve atualizar parcialmente o campo "name"', async () => {
    const fakeObj = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
      },
    };

    const created = await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(fakeObj)
      .expectStatus(StatusCodes.OK)
      .toss();

    const partialUpdate = {
      name: faker.commerce.productName(),
    };

    await pactum
      .spec()
      .patch(`${baseUrl}${endpoint}/${created.body.id}`)
      .withJson(partialUpdate)
      .expectStatus(StatusCodes.OK);

    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}/${created.body.id}`)
      .expectStatus(StatusCodes.OK)
      .expectJsonLike({
        id: created.body.id,
        name: partialUpdate.name,
      });
  });

  it('GET /objects — deve suportar filtro por nome', async () => {
    const filterName = 'TestProduct';

    const fakeObj = {
      name: filterName,
      data: {
        color: faker.color.human(),
        price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
      },
    };

    await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(fakeObj)
      .expectStatus(StatusCodes.OK);

    await pactum
      .spec()
      .get(`${baseUrl}${endpoint}`)
      .withQueryParams({ name: filterName })
      .expectStatus(StatusCodes.OK)
      .expectJsonLike([
        {
          name: filterName,
        },
      ]);
  });

  it('POST /objects — deve falhar se faltar campo obrigatório "name"', async () => {
    const invalidObj = {
      data: {
        color: faker.color.human(),
        price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
      },
    };

    const res = await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(invalidObj)
      .expectStatus(StatusCodes.BAD_REQUEST)
      .toss();

    console.log('Resposta falta name:', res.body);
  });

  it('POST /objects — deve falhar ao enviar "price" como string inválida', async () => {
    const invalidObj = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        price: "invalid-price-string",
      },
    };

    const res = await pactum
      .spec()
      .post(`${baseUrl}${endpoint}`)
      .withJson(invalidObj)
      .expectStatus(StatusCodes.BAD_REQUEST)
      .toss();

    console.log('Resposta price inválida:', res.body);
  });
});
