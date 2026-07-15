import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

export const getPublications = async (
    page = 1,
    perPage = 20,
    search = ""
) => {

    const response = await axios.get(`${API_URL}/publications`, {
        params: {
            page: page,
            per_page: perPage,
            search: search,
        },
    });

    return response.data;
};