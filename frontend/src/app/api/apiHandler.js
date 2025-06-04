import { axiosClient } from "@/app/api/apiClient";

export async function signup(payload) {
  try {
    const res = await axiosClient.post(`/v1/user/signup`, payload);
    console.log("Signup response:", res);
    return res; 
  } catch (err) {
    console.log("Error in signupUser:", err);
    throw err;
  }
}

export async function login(data) {
  try {
    console.log("Login data:", data);
    console.log("Login data role:", data.role);
    const endpoint = data.role === 'admin' ? '/v1/admin/login' : '/v1/user/login';
    const response = await axiosClient.post(endpoint, data);
    return response; 
  } catch (err) {
    console.error('Login Error:', err);
    throw new Error('Login Failed');
  }
}

export const fetchAllBooks = async () => {
  try {
    const response = await axiosClient.post('/v1/admin/all-books');
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
};

export const getBookById = async (book_id) => {
  try {
    const response = await axiosClient.post(`/v1/admin/book-details`, {book_id} );
    console.log("Book details response:", response);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
};

export const addBook = async (bookData) => {
  try {
    const response = await axiosClient.post('/v1/admin/add-book', bookData);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
};

export const updateBook = async (bookData) => {
  try {
    const response = await axiosClient.put(`/books/${bookData.id}`, bookData);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
};

export const deleteBook = async (data) => {
  try {
    const response = await axiosClient.post('/v1/admin/delete-book', data);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
};

export const updateBookProgress = async (book_id, book_progress, completion_percentage) => {
  try {
    const response = await axiosClient.post('/v1/user/update-book-progress', { book_id, book_progress, completion_percentage });
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  } 
}

export const getAllBooks = async () => {
  try {
    const response = await axiosClient.post('/v1/user/get-all-books');
    console.log("All books response:", response);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
}

export const fetchAllGenres = async () => {
  try {
    const response = await axiosClient.post('/v1/admin/genres');
    console.log("Genres response:", response);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
}

export const fetchAllMembers = async () => {
  try {
    const response = await axiosClient.post('/v1/admin/all-users');
    console.log("Members response:", response);
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed');
  }
};

export const updateUserRole = async ({ user_id, new_role }) => {
  try {
    const response = await axiosClient.post('/v1/admin/change-user-role', {
      user_id,
      new_role,
    });
    console.log("Update User Role response:", response);
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to update user role');
  }
};

export const fetchAllDiscussions = async () => {
  try {
    const response = await axiosClient.post(`/v1/admin/all-discussions`);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
};

export const getDiscussionById = async (data) => {
  try {
    const response = await axiosClient.post(`/v1/admin/discussion-details`, data);
    console.log("Raw API response:", response.data);

    if (response.code === "1") {
      return response;
    } else {
      throw new Error(response.message || "Failed to fetch discussion details");
    }
  } catch (err) {
    console.error("Error fetching discussion by ID:", err);
    throw new Error("Failed to fetch discussion details");
  }
};


export const moderateDiscussion = async (data) => {
  try {
    const response = await axiosClient.post(`/v1/admin/moderate-discussions`, { action: data.action });
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
}

export const fetchStatistics = async () =>{
  try {
    const response = await axiosClient.post(`/v1/admin/user-stats`);
    console.log("User stats response:", response);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
}

export const fetchUserClubs = async () => {
  try {
    const response = await axiosClient.post('/v1/user/my-clubs');
    console.log("User clubs response:", response);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
}

export const fetchAllClubs = async () => {
  try {
    const response = await axiosClient.post('/v1/user/all-clubs');
    console.log("Clubs response:", response);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
};

export const joinClub = async (club_id) => {
  try {
    const response = await axiosClient.post(`/v1/user/join-club`, { club_id });
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
};

export const leaveClub = async (club_id) => {
  try {
    const response = await axiosClient.post(`/v1/user/leave-club`, { club_id });
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
}

export const fetchAllBooksUser = async () => {
  try {
    const response = await axiosClient.post('/v1/user/all-books');
    console.log("User books response:", response);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
};

export const getDiscussions = async () => {
  try {
    const response = await axiosClient.post(`/v1/user/get-discussions`);
    console.log("Discussions response:", response);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
};

export const createDiscussion = async (data) => {
  try {
    const response = await axiosClient.post(`/v1/user/create-discussion`, data);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
}

export const addReplyToDiscussion = async (discussion_id, user_id, comment) => {
  try {
    const response = await axiosClient.post(`/v1/user/add-comment`, { discussion_id, user_id, comment });
    console.log("Add reply response:", response);
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
}

export const likeDiscussionReply = async (discussion_id, comment_id, user_id, is_like) => {
  try {
    const response = await axiosClient.post(`/v1/user/like-reply`, { discussion_id, comment_id, user_id, is_like });
    return response;
  } catch (err) {
    console.error('Error:', err);
    throw new Error('Failed');
  }
}

export const clubMemberListing = async (club_id ) => {
  try {
    const response = await axiosClient.post('/v1/admin/club-members-listing', {
      club_id
    });
    console.log("Update User Role response:", response);
    return response;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to update user role');
  }
};

export const approveClubMember = async (user_id, club_id) => {
  try {
    const response = await axiosClient.post('/v1/admin/approve-member', {
      user_id,
      club_id
    });
    
    return response;
  } catch (err) {
    console.error('Error approving club member:', err);
    // Include more details in the error message
    const errorMessage = err.response?.data?.message?.keyword || 'Failed to approve club member';
    throw new Error(errorMessage);
  }
};

export const removeClubMember = async (user_id, club_id) => {
  try {
    const response = await axiosClient.post('/v1/admin/remove-member', { user_id, club_id });
    
    
    // Return response data instead of the whole response object
    return response;
  } catch (err) {
    console.error('Error removing club member:', err);
    // Include more details in the error message
    const errorMessage = response.message || 'Failed to remove club member';
    throw new Error(errorMessage);
  }
};

