const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCard = require('@app/repository/creator-cards');

const spec = `
root {
  slug string<trim|lowercase>
  creator_reference string<trim|length:20>
}
`;

const parsedSpec = validator.parse(spec);

async function deleteCard(serviceData) {
  const data = validator.validate(serviceData, parsedSpec);

  try {
    const card = await CreatorCard.findOne({
      query: {
        slug: data.slug,
      },
    });

    if (!card) {
      throwAppError(CreatorCardMessages.NOT_FOUND, ERROR_CODE.CARD_NOT_FOUND);
    }

    if (card.creator_reference !== data.creator_reference) {
      throwAppError(CreatorCardMessages.NOT_FOUND, ERROR_CODE.CARD_NOT_FOUND);
    }

    const deletedTimestamp = Date.now();

    await CreatorCard.deleteOne({
      query: {
        _id: card._id,
      },
    });

    response = {
      id: card._id,
      title: card.title,
      description: card.description,
      slug: card.slug,
      creator_reference: card.creator_reference,
      links: card.links || [],
      service_rates: card.service_rates || null,
      status: card.status,
      access_type: card.access_type,
      access_code: card.access_code,
      created: card.created,
      updated: card.updated,
      deleted: deletedTimestamp,
    };
  } catch (error) {
    appLogger.errorX(error, 'delete-card-error');
    throw error;
  }
  return response;
}

module.exports = deleteCard;
