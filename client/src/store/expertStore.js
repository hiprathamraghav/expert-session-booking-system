import { create } from "zustand";
import { api, getErrorMessage } from "../api/client.js";

const pageSize = 6;
const defaultMeta = { page: 1, totalPages: 1, total: 0 };

export const useExpertStore = create((set, get) => ({
  experts: [],
  categories: [],
  meta: defaultMeta,
  listQuery: {
    search: "",
    category: "",
    page: 1
  },
  listLoading: false,
  listError: "",
  expertById: {},
  expertLoading: {},
  expertErrors: {},

  setListQuery(update) {
    set((state) => ({
      listQuery: {
        ...state.listQuery,
        ...update
      }
    }));
  },

  async fetchExperts(update = {}) {
    const query = {
      ...get().listQuery,
      ...update
    };

    set({
      listQuery: query,
      listLoading: true,
      listError: ""
    });

    try {
      const response = await api.get("/experts", {
        params: {
          page: query.page,
          limit: pageSize,
          search: query.search || undefined,
          category: query.category || undefined
        }
      });

      set((state) => ({
        experts: response.data.data,
        meta: response.data.meta,
        categories: response.data.categories || [],
        listLoading: false,
        expertById: {
          ...state.expertById,
          ...Object.fromEntries(
            response.data.data.map((expert) => [
              expert._id,
              {
                ...state.expertById[expert._id],
                ...expert
              }
            ])
          )
        }
      }));
    } catch (requestError) {
      set({
        listError: getErrorMessage(requestError),
        listLoading: false
      });
    }
  },

  async fetchExpert(id, { silent = false } = {}) {
    if (!silent) {
      set((state) => ({
        expertLoading: {
          ...state.expertLoading,
          [id]: true
        },
        expertErrors: {
          ...state.expertErrors,
          [id]: ""
        }
      }));
    }

    try {
      const response = await api.get(`/experts/${id}`);
      set((state) => ({
        expertById: {
          ...state.expertById,
          [id]: response.data.data
        },
        expertLoading: {
          ...state.expertLoading,
          [id]: false
        }
      }));

      return response.data.data;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      set((state) => ({
        expertLoading: {
          ...state.expertLoading,
          [id]: false
        },
        expertErrors: {
          ...state.expertErrors,
          [id]: message
        }
      }));
      throw requestError;
    }
  },

  markSlotBooked({ expertId, date, timeSlot }) {
    set((state) => {
      const expert = state.expertById[expertId];
      if (!expert?.slotGroups) {
        return state;
      }

      return {
        expertById: {
          ...state.expertById,
          [expertId]: {
            ...expert,
            slotGroups: expert.slotGroups.map((group) => ({
              ...group,
              slots: group.slots.map((slot) =>
                group.date === date && slot.time === timeSlot
                  ? { ...slot, booked: true }
                  : slot
              )
            }))
          }
        }
      };
    });
  }
}));
