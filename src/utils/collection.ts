interface GroupedCollection {
  [x: string]: Record<string, string | number>[];
}

export function groupBy(
  data: Record<string, string | number>[],
  column: string
) {
  return data.reduce<GroupedCollection>((groupedData, entry) => {
    // If the value cannot be converted to a string, skip it
    if (!entry[column]?.toString) {
      return groupedData;
    }

    const groupByValue = entry[column].toString();

    return {
      ...groupedData,
      [groupByValue]: [...(groupedData[groupByValue] ?? []), entry]
    };
  }, {});
}

export function projectData(
  data: Record<string, string | number>[],
  projectionColumns: string[]
) {
  return data.map(entry =>
    Object.fromEntries(
      Object.entries(entry).filter(([key]) => projectionColumns.includes(key))
    )
  );
}
