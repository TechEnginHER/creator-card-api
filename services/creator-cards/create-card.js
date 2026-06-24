const validator = require('@app-core/validator');
const { throwAppError, ERROR_CODE } = require('@app-core/errors');
const { appLogger } = require('@app-core/logger');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCard = require('@app/repository/creator-cards');
const { ulid } = require('@app-core/randomness');

const spec = `
root {
  title string<trim|minLength:3|maxLength:100>
  description? string<trim|maxLength:500>
  slug? string<trim|lowercase>
  creator_reference string<trim>

  links[]? {
    title string<trim|minLength:1|maxLength:100>
    url string<trim|maxLength:200>
  }

  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<trim|minLength:3|maxLength:100>
      description string<trim|maxLength:250>
      amount number<min:1>
    }
  }

  status string(draft|published)
  access_type? string(public|private)
  access_code? string<trim>
}
`;

const parsedSpec = validator.parse(spec);

function generateSlug(title) {
  const lower = title.toLowerCase();

  let slug = '';
  const allowed = 'abcdefghijklmnopqrstuvwxyz0123456789-_ ';

  for (let i = 0; i < lower.length; i++) {
    const char = lower[i];

    if (allowed.includes(char)) {
      slug += char === ' ' ? '-' : char;
    }
  }

  return slug;
}

function randomSuffix() {
  return ulid().slice(-6).toLowerCase();
}

function isValidSlug(slug) {
  if (slug.length < 5 || slug.length > 50) {
    return false;
  }

  const allowed = 'abcdefghijklmnopqrstuvwxyz0123456789-_';

  for (let i = 0; i < slug.length; i++) {
    if (!allowed.includes(slug[i])) {
      return false;
    }
  }

  return true;
}

function isValidAccessCode(code) {
  if (code.length !== 6) {
    return false;
  }

  const allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < code.length; i++) {
    if (!allowed.includes(code[i])) {
      return false;
    }
  }

  return true;
}

async function createCard(serviceData) {
  let response;

  const data = validator.validate(serviceData, parsedSpec);

  try {
    const accessType = data.access_type || 'public';

    if (data.creator_reference.length !== 20) {
      throwAppError(CreatorCardMessages.INVALID_CREATOR_REFERENCE, ERROR_CODE.INVLDDATA);
    }
    if (accessType === 'private' && !data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, ERROR_CODE.MISSING_ACCESS_CODE);
    }

    if (accessType === 'public' && data.access_code) {
      throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED, ERROR_CODE.PUBLIC_HAS_ACCESS_CODE);
    }

    if (data.access_code && !isValidAccessCode(data.access_code)) {
      throwAppError(CreatorCardMessages.INVALID_ACCESS_CODE_FORMAT, ERROR_CODE.INVLDDATA);
    }

    if (data.links?.length) {
      for (const link of data.links) {
        if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
          throwAppError(CreatorCardMessages.INVALID_LINK_URL, ERROR_CODE.INVLDDATA);
        }
      }
    }

    if (data.service_rates) {
      if (!data.service_rates.rates || data.service_rates.rates.length === 0) {
        throwAppError(CreatorCardMessages.EMPTY_SERVICE_RATES, ERROR_CODE.INVLDDATA);
      }

      for (const rate of data.service_rates.rates) {
        if (!Number.isInteger(rate.amount) || rate.amount <= 0) {
          throwAppError(CreatorCardMessages.INVALID_SERVICE_RATE_AMOUNT, ERROR_CODE.INVLDDATA);
        }
      }
    }

    let slug;

    if (data.slug) {
      slug = data.slug;

      if (!isValidSlug(slug)) {
        throwAppError(CreatorCardMessages.INVALID_SLUG, ERROR_CODE.INVLDDATA);
      }

      const existingCard = await CreatorCard.findOne({
        query: { slug },
      });

      if (existingCard) {
        throwAppError(CreatorCardMessages.SLUG_ALREADY_EXISTS, ERROR_CODE.SLUG_TAKEN);
      }
    } else {
      slug = generateSlug(data.title);

      let existingCard = await CreatorCard.findOne({
        query: { slug },
      });

      while (!isValidSlug(slug) || existingCard) {
        slug = `${slug}-${randomSuffix()}`;

        existingCard = await CreatorCard.findOne({
          query: { slug },
        });
      }
    }

    const card = await CreatorCard.create({
      title: data.title,
      description: data.description || null,
      slug,
      creator_reference: data.creator_reference,
      links: data.links || [],
      service_rates: data.service_rates || null,
      access_type: accessType,
      access_code: data.access_code || null,
      status: data.status,
    });

    response = {
      id: card._id,
      title: card.title,
      description: card.description,
      slug: card.slug,
      creator_reference: card.creator_reference,
      links: card.links,
      service_rates: card.service_rates,
      status: card.status,
      access_type: card.access_type,
      access_code: card.access_code,
      created: card.created,
      updated: card.updated,
      deleted: card.deleted || null,
    };
  } catch (error) {
    appLogger.error(error, 'create-card-error');
    throw error;
  }

  return response;
}

module.exports = createCard;
