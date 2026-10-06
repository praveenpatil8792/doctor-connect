import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    generateAvailabilitySlots,
    getAvailability,
    updateAvailability
} from "../services/doctorService";

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const emptyWeek = () =>
    days.map((day) => ({
        day,
        openingTime: "",
        closingTime: "",
        confirmed: false,
        holiday: false,
        slots: [],
        excludedSlots: []
    }));

const getCurrentWeekMonday = () => {
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const formatTime = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

export default function Availability() {
    const [availability, setAvailability] = useState(emptyWeek);
    const [slotDuration, setSlotDuration] = useState(30);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirmingDay, setConfirmingDay] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const currentWeekStart = useMemo(() => getCurrentWeekMonday(), []);

    useEffect(() => {
        (async () => {
            try {
                const data = await getAvailability();
                const savedWeek = data.availabilityWeekStart || "";

                // A previous week's schedule must not automatically become next week's schedule.
                if (savedWeek && savedWeek !== currentWeekStart) {
                    setAvailability(emptyWeek());
                    setSlotDuration(Number(data.slotDuration) || 30);
                    return;
                }

                const saved = data.availability || [];
                setAvailability(
                    days.map((day) => {
                        const item = saved.find((entry) => entry.day === day);
                        const session = item?.sessions?.[0];
                        const holiday = item?.holiday === true;

                        return {
                            day,
                            openingTime: session?.startTime || "",
                            closingTime: session?.endTime || "",
                            confirmed: Boolean(session?.startTime && session?.endTime) && !holiday,
                            holiday,
                            slots: [],
                            excludedSlots: item?.excludedSlots || []
                        };
                    })
                );
                setSlotDuration(Number(data.slotDuration) || 30);
            } catch (e) {
                setError(e.response?.data?.message || "Unable to load availability.");
            } finally {
                setLoading(false);
            }
        })();
    }, [currentWeekStart]);

    const updateDay = (dayIndex, changes) => {
        setAvailability((current) =>
            current.map((day, index) =>
                index === dayIndex ? { ...day, ...changes } : day
            )
        );
    };

    const confirmDay = async (dayIndex) => {
        setMessage("");
        setError("");

        const day = availability[dayIndex];

        if (day.holiday) {
            setError(`${day.day}: remove Holiday before confirming working hours.`);
            return;
        }

        if (!day.openingTime || !day.closingTime) {
            setError(`${day.day}: please enter both opening time and closing time.`);
            return;
        }

        if (!Number.isInteger(Number(slotDuration)) || Number(slotDuration) < 5 || Number(slotDuration) > 240) {
            setError("Slot duration must be between 5 and 240 minutes.");
            return;
        }

        try {
            setConfirmingDay(dayIndex);
            const result = await generateAvailabilitySlots(
                day.openingTime,
                day.closingTime,
                Number(slotDuration)
            );

            setAvailability((current) =>
                current.map((item, index) =>
                    index === dayIndex
                        ? {
                              ...item,
                              confirmed: true,
                              excludedSlots: [],
                              slots: result.slots || []
                          }
                        : item
                )
            );
        } catch (e) {
            setError(e.response?.data?.message || `${day.day}: invalid opening/closing time.`);
        } finally {
            setConfirmingDay(null);
        }
    };

    const toggleHoliday = (dayIndex) => {
        setMessage("");
        setError("");

        setAvailability((current) =>
            current.map((day, index) => {
                if (index !== dayIndex) return day;

                const holiday = !day.holiday;
                return {
                    ...day,
                    holiday,
                    confirmed: false,
                    openingTime: holiday ? "" : day.openingTime,
                    closingTime: holiday ? "" : day.closingTime,
                    slots: [],
                    excludedSlots: []
                };
            })
        );
    };

    const discardSlot = (dayIndex, slotIndex) => {
        setAvailability((current) =>
            current.map((day, index) => {
                if (index !== dayIndex) return day;
                const slot = day.slots[slotIndex];
                return {
                    ...day,
                    slots: day.slots.filter((_, i) => i !== slotIndex),
                    excludedSlots: [...new Set([...day.excludedSlots, slot.startTime])]
                };
            })
        );
    };

    const save = async () => {
        setMessage("");
        setError("");

        if (!Number.isInteger(Number(slotDuration)) || Number(slotDuration) < 5 || Number(slotDuration) > 240) {
            setError("Slot duration must be between 5 and 240 minutes.");
            return;
        }

        for (const day of availability) {
            if (day.holiday) continue;
            if (!day.confirmed) {
                setError(`${day.day}: click Confirm after entering opening and closing time, or mark the day as Holiday.`);
                return;
            }
        }

        const payload = availability.map((day) => ({
            day: day.day,
            holiday: day.holiday,
            sessions: day.holiday
                ? []
                : [{ startTime: day.openingTime, endTime: day.closingTime }],
            excludedSlots: day.holiday ? [] : day.excludedSlots
        }));

        try {
            setSaving(true);
            await updateAvailability(payload, Number(slotDuration), currentWeekStart);
            setMessage("Slots saved successfully. The same availability is now reflected on the patient booking page for this week.");
        } catch (e) {
            setError(e.response?.data?.message || "Unable to save availability.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="max-w-5xl mx-auto py-10 px-4">Loading availability...</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Doctor Availability & Appointment</h1>
                    <p className="text-gray-500 mt-1">
                        Configure this week's working hours. Previous-week slots are automatically discarded.
                    </p>
                </div>

                {message && (
                    <div className="mb-5 rounded-lg bg-green-50 text-green-700 px-4 py-3">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-5 rounded-lg bg-red-50 text-red-700 px-4 py-3">
                        {error}
                    </div>
                )}

                <section className="bg-white rounded-2xl shadow p-6 mb-6">
                    <div className="max-w-sm">
                        <label className="block text-sm font-semibold mb-2">
                            Slot Duration (minutes)
                        </label>
                        <input
                            type="number"
                            min="5"
                            max="240"
                            step="5"
                            value={slotDuration}
                            onChange={(e) => {
                                setSlotDuration(e.target.value);
                                setAvailability((current) =>
                                    current.map((day) => ({
                                        ...day,
                                        confirmed: false,
                                        slots: [],
                                        excludedSlots: []
                                    }))
                                );
                            }}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Example: 30 minutes creates 9:00–9:30, 9:30–10:00 and so on.
                    </p>
                </section>

                <div className="space-y-5">
                    {availability.map((day, dayIndex) => (
                        <section key={day.day} className="bg-white rounded-2xl shadow p-6">
                            <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                                <div className="lg:w-32 pt-2">
                                    <h2 className="text-lg font-bold">{day.day}</h2>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Opening Time
                                            </label>
                                            <input
                                                type="time"
                                                value={day.openingTime}
                                                disabled={day.holiday}
                                                onChange={(e) => updateDay(dayIndex, {
                                                    openingTime: e.target.value,
                                                    confirmed: false,
                                                    slots: [],
                                                    excludedSlots: []
                                                })}
                                                className="border rounded-lg px-3 py-2 disabled:bg-gray-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Closing Time
                                            </label>
                                            <input
                                                type="time"
                                                value={day.closingTime}
                                                disabled={day.holiday}
                                                onChange={(e) => updateDay(dayIndex, {
                                                    closingTime: e.target.value,
                                                    confirmed: false,
                                                    slots: [],
                                                    excludedSlots: []
                                                })}
                                                className="border rounded-lg px-3 py-2 disabled:bg-gray-100"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            disabled={day.holiday || confirmingDay === dayIndex}
                                            onClick={() => confirmDay(dayIndex)}
                                            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {confirmingDay === dayIndex ? "Generating..." : "Confirm"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => toggleHoliday(dayIndex)}
                                            className={`px-5 py-2 rounded-lg border font-medium ${
                                                day.holiday
                                                    ? "bg-red-600 text-white border-red-600"
                                                    : "bg-white text-red-600 border-red-300 hover:bg-red-50"
                                            }`}
                                        >
                                            {day.holiday ? "Holiday Selected" : "Holiday"}
                                        </button>
                                    </div>

                                    {day.holiday ? (
                                        <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-gray-600">
                                            {day.day} is marked as a holiday. No patient slots will be available.
                                        </div>
                                    ) : day.confirmed ? (
                                        <div className="mt-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h3 className="font-semibold">Generated Appointment Slots</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {formatTime(day.openingTime)} to {formatTime(day.closingTime)}
                                                    </p>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {day.slots.length} slot{day.slots.length === 1 ? "" : "s"}
                                                </span>
                                            </div>

                                            {day.slots.length === 0 ? (
                                                <div className="rounded-xl bg-yellow-50 text-yellow-700 px-4 py-3">
                                                    No slots remain. You can change the working hours and click Confirm again.
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {day.slots.map((slot, slotIndex) => (
                                                        <div
                                                            key={`${day.day}-${slot.startTime}-${slot.endTime}`}
                                                            className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3"
                                                        >
                                                            <span className="font-medium">
                                                                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => discardSlot(dayIndex, slotIndex)}
                                                                title="Discard this slot"
                                                                className="ml-3 w-8 h-8 shrink-0 rounded-full bg-red-100 text-red-600 text-xl font-bold hover:bg-red-200 flex items-center justify-center"
                                                            >
                                                                −
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-gray-500">
                                            Enter opening and closing time, then click Confirm to generate slots.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                <div className="flex justify-end mt-7">
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-60 font-semibold"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
