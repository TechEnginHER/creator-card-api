const CreatorCardMessages = {
  CREATED: 'Creator Card Created Successfully.',
  RETRIEVED: 'Creator Card Retrieved Successfully.',
  DELETED: 'Creator Card Deleted Successfully.',

  // SL02
  SLUG_ALREADY_EXISTS: 'Slug is already taken',

  // AC01
  ACCESS_CODE_REQUIRED: 'access_code is required when access_type is private',

  // AC05
  ACCESS_CODE_NOT_ALLOWED: 'access_code can only be set on private cards',

  // NF01 & NF02
  NOT_FOUND: 'Creator card not found',

  // AC03
  PRIVATE_CARD_ACCESS: 'This card is private. An access code is required',

  // AC04
  INVALID_ACCESS_CODE: 'Invalid access code',

  // Validation messages
  INVALID_CREATOR_REFERENCE: 'creator_reference must be exactly 20 characters',

  INVALID_ACCESS_CODE_FORMAT: 'access_code must be exactly 6 alphanumeric characters',

  INVALID_LINK_URL: 'url must start with http:// or https://',

  EMPTY_SERVICE_RATES: 'service_rates.rates must contain at least one item',

  INVALID_SERVICE_RATE_AMOUNT: 'service rate amount must be a positive integer',

  INVALID_SLUG:
    'slug must be 5-50 characters and contain only letters, numbers, hyphens and underscores',
};

module.exports = CreatorCardMessages;
