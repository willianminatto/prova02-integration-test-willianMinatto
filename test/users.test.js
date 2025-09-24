const request = require('supertest');
const app = require('../app');

describe('Testes de Users API', () => {
  it('GET /users → deve listar usuários', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('POST /users → deve criar um novo usuário', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Novo', email: 'novo@email.com' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /users/:id → deve retornar um usuário específico', async () => {
    const res = await request(app).get('/users/1');
    expect([200, 404]).toContain(res.statusCode);
  });

  it('PUT /users/:id → deve atualizar um usuário', async () => {
    const res = await request(app)
      .put('/users/1')
      .send({ name: 'Atualizado', email: 'att@email.com' });

    expect([200, 404]).toContain(res.statusCode);
  });

  it('DELETE /users/:id → deve excluir usuário', async () => {
    const res = await request(app).delete('/users/1');
    expect([204, 404]).toContain(res.statusCode);
  });
});
