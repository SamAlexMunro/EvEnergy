export const limitArraySize = <Type>(array: Type[], maxSize = 75): Type[] => {
  const originalSize = array.length;
  if (originalSize <= maxSize) {
    return array;
  }

  const stepSize = originalSize / maxSize;

  const limitedArray = [];

  for (let i = 0; i < maxSize; i++) {
    const index = Math.floor(i * stepSize);

    if (index < originalSize) {
      limitedArray.push(array[index]);
    }
  }

  return limitedArray;
};
