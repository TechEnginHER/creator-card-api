const { createHandler } = require('@app-core/server');
const createCard = require('@app/services/creator-cards/create-card');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  middlewares: [],
  async handler(rc, helpers) {
    const response = await createCard(rc.body);
    return {
      status: helpers.http_statuses.HTTP_201_CREATED,
      message: 'Creator card created successfully',
      data: response,
    };
  },
});
