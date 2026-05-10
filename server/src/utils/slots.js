export function flattenSlots(slotGroups = []) {
  return slotGroups.flatMap((group) =>
    group.times.map((time) => ({
      date: group.date,
      timeSlot: time
    }))
  );
}

export function isSlotOffered(expert, date, timeSlot) {
  return expert.availableSlots.some(
    (group) => group.date === date && group.times.includes(timeSlot)
  );
}

export function buildSlotGroups(expert, bookings = []) {
  const bookedSet = new Set(
    bookings.map((booking) => `${booking.date}|${booking.timeSlot}`)
  );

  return expert.availableSlots.map((group) => ({
    date: group.date,
    slots: group.times.map((time) => ({
      time,
      booked: bookedSet.has(`${group.date}|${time}`)
    }))
  }));
}
