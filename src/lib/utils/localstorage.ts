import pkg from '@/../package.json';

function lsAddVersion(value: any, version: string) {
  return {
    data: value,
    _version: version,
  };
}

function lsGetKey(key: string) {
  return `${pkg.name}.${key}`;
}

export function lsSet(key: string, value: any, version?: string) {
  const data = version != null ? lsAddVersion(value, version) : value;

  return localStorage.setItem(lsGetKey(key), JSON.stringify(data));
}

export function lsGet<T = any>(
  key: string,
  defaultValue: any = null,
  version?: string
): T {
  const rawValue = localStorage.getItem(lsGetKey(key));

  if (rawValue != null) {
    try {
      const value = JSON.parse(rawValue);
      if (version != null) {
        return value._version === version ? value.data : defaultValue;
      }
      return value;
    } catch (e) {
      return defaultValue;
    }
  }

  return defaultValue;
}

export function lsRemove(key: string) {
  return localStorage.removeItem(lsGetKey(key));
}
