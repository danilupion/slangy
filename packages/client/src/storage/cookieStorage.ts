type Dictionary = { [key: string]: string };

const cookieSeparator = '; ';
const keyValueSeparator = '=';

const parse = (): Dictionary =>
  document.cookie.split(cookieSeparator).reduce((acc, cur) => {
    const [key, value] = cur.split(keyValueSeparator);
    return {
      ...acc,
      [decodeURIComponent(key)]: decodeURIComponent(value),
    };
  }, {});

const save = (newCookies: Dictionary) => {
  const cookies = parse();
  const newKeys = Object.keys(newCookies);
  const keys = Object.keys(cookies);

  const keysToRemove = keys.filter((k) => !newKeys.includes(k));
  for (const key of keysToRemove) {
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  const keysToSet = newKeys.filter((k) => !keys.includes(k) || cookies[k] !== newCookies[k]);
  for (const key of keysToSet) {
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(newCookies[key])}`;
  }
};

const cookieStorage: Storage = {
  key(index) {
    const values = Object.entries(parse());
    return values[index] && values[index][1];
  },
  get length() {
    return Object.entries(parse()).length;
  },
  removeItem(key) {
    const values = parse();
    delete values[key];
    save(values);
  },
  setItem(key, value) {
    save({
      ...parse(),
      [key]: value,
    });
  },
  clear() {
    save({});
  },
  getItem(key: string) {
    const values = parse();

    return values[key];
  },
};

export default cookieStorage;
