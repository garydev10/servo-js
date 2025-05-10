"use strict";

const getDaylightTimeString = () => {
  const rightNow = new Date();
  rightNow.setMinutes(rightNow.getMinutes() - rightNow.getTimezoneOffset());
  const ds = rightNow.toISOString();
  return ds;
};

export { getDaylightTimeString };
