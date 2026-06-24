const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCard = require('@app/repository/creator-cards');
const CreatorCardMessages = require('@app/messages/creator-card');

const spec = `
root {
  slug string<trim|lowercase>
  access_code? string<trim>
}
`;

const parsedSpec = validator.parse(spec);

async function getCard(serviceData) {
  const data = validator.validate(serviceData, parsedSpec);

  try {
    /* NOT FOUND (NF01) */
    const card = await CreatorCard.findOne({
      query: { slug: data.slug },
    });

    if (!card) {
      throwAppError(CreatorCardMessages.NOT_FOUND, ERROR_CODE.CARD_NOT_FOUND);
    }

    /*DRAFT CHECK (NF02)*/
    if (card.status === 'draft') {
      throwAppError(CreatorCardMessages.NOT_FOUND, ERROR_CODE.CARD_IS_DRAFT);
    }

    /* PRIVATE ACCESS RULES */
    if (card.access_type === 'private') {
      // AC03
      if (!data.access_code) {
        throwAppError(CreatorCardMessages.PRIVATE_CARD_ACCESS, ERROR_CODE.ACCESS_CODE_REQUIRED);
      }

      // AC04
      if (data.access_code !== card.access_code) {
        throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE, ERROR_CODE.INVALID_ACCESS_CODE);
      }
    }
    return {
      id: card._id,
      title: card.title,
      description: card.description,
      slug: card.slug,
      creator_reference: card.creator_reference,
      links: card.links || [],
      service_rates: card.service_rates || null,
      status: card.status,
      access_type: card.access_type,
      created: card.created,
      updated: card.updated,
      deleted: card.deleted || null,
    };
  } catch (error) {
    appLogger.error(error, 'get-card-error');
    throw error;
  }
}

module.exports = getCard;
