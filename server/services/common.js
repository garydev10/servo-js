"use strict";

const getDaylightTimeString = () => {
  const rightNow = new Date();
  rightNow.setMinutes(rightNow.getMinutes() - rightNow.getTimezoneOffset());
  const ds = rightNow.toISOString();
  return ds;
};

const isMissing = (field) => field === undefined || field === "";

export { getDaylightTimeString, isMissing };
