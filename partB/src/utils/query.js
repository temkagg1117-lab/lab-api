function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function applyFiltering(items, query, allowedFilters) {
  return items.filter((item) =>
    allowedFilters.every((field) => {
      const value = query[field];
      if (value === undefined || value === "") {
        return true;
      }

      const itemValue = item[field];
      if (itemValue === undefined || itemValue === null) {
        return false;
      }

      return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
    })
  );
}

function applySorting(items, sortBy, sortOrder, allowedSorts) {
  if (!sortBy || !allowedSorts.includes(sortBy)) {
    return [...items];
  }

  const direction = String(sortOrder).toLowerCase() === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const left = a[sortBy];
    const right = b[sortBy];

    if (left === right) {
      return 0;
    }

    return left > right ? direction : -direction;
  });
}

function paginate(items, query) {
  const page = toPositiveInt(query.page, 1);
  const limit = toPositiveInt(query.limit, 10);
  const start = (page - 1) * limit;

  return {
    data: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      totalItems: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit))
    }
  };
}

module.exports = {
  applyFiltering,
  applySorting,
  paginate,
  toPositiveInt
};
