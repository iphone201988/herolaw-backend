export type LoginAdminRequest = {
  email: string;
  password: string;
};

export type CreateAttorneyRequest = {
  name: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  physicalAddress?: string;
  mailingAddress?: string;
  password?: string;
};

export type UpdateAttorneyRequest = {
  name?: string;
  lastName?: string;
  email?: string;
  countryCode?: string;
  phone?: string;
  password?: string;
  physicalAddress?: string;
  mailingAddress?: string;
};

