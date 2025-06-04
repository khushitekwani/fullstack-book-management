"use client";
import React, { useState, useEffect } from "react";
import { fetchAllClubs, joinClub, leaveClub } from "../api/apiHandler"; // Adjust path if needed

const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingClubId, setProcessingClubId] = useState(null);

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    setLoading(true);
    try {
      const response = await fetchAllClubs();
      const clubList = response.data || [];
      setClubs(clubList);
    } catch (error) {
      console.error("Failed to load clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (club_id) => {
    setProcessingClubId(club_id);
    try {
      await joinClub(club_id);
      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club.id === club_id
            ? {
                ...club,
                is_joined: true,
                active_members: (club.active_members || 0) + 1,
              }
            : club
        )
      );
    } catch (error) {
      console.error("Join club failed:", error);
    } finally {
      setProcessingClubId(null);
    }
  };

  const handleLeaveClub = async (club_id) => {
    setProcessingClubId(club_id);
    try {
      await leaveClub(club_id);
      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club.id === club_id
            ? {
                ...club,
                is_joined: false,
                active_members: Math.max((club.active_members || 1) - 1, 0),
              }
            : club
        )
      );
    } catch (error) {
      console.error("Leave club failed:", error);
    } finally {
      setProcessingClubId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">All Clubs</h1>

      {loading ? (
        <p>Loading clubs...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => {
            const isProcessing = processingClubId === club.id;

            return (
              <div
                key={club.id}
                className="bg-white shadow-md rounded-lg p-4 border"
              >
                <h3 className="text-xl font-semibold mb-2">{club.name}</h3>
                <p className="text-sm text-gray-600">
                  Active Members: {club.active_members || 0}
                </p>

                {club.is_joined && (
                  <p className="text-green-600 text-sm mt-2 font-medium">
                    You are a member of this club
                  </p>
                )}

                <button
                  onClick={() =>
                    club.is_joined
                      ? handleLeaveClub(club.id)
                      : handleJoinClub(club.id)
                  }
                  className={`mt-4 w-full ${
                    club.is_joined
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white font-medium py-2 px-4 rounded-lg transition duration-300`}
                  disabled={isProcessing}
                >
                  {isProcessing
                    ? club.is_joined
                      ? "Leaving..."
                      : "Joining..."
                    : club.is_joined
                    ? "Leave Club"
                    : "Join Club"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClubsPage;
