// eslint-disable-next-line no-useless-escape
export const email = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

// eslint-disable-next-line no-useless-escape
export const password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#\$%\^\&*\)\(\]\[\+=\.,_-]).{8,}$/;

export const objectId = /^[a-f\d]{24}$/i;
