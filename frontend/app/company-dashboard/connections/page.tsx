"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/context/UserContext";
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  MessageSquare, 
  Search,
  User,
  GraduationCap
} from "lucide-react";

interface ConnectionItem {
  id: string;
  recruiterId: string;
  recruiterName: string;
  companyName: string;
  studentId: string;
  studentName: string;
  message: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export default function OutgoingConnections() {
  const { user: currentUser } = useUser();
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  const fetchConnections = async () => {
    if (!currentUser?.uid || !db) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const connectionsRef = collection(db, "connections");
      let fetched: ConnectionItem[] = [];

      try {
        // Query to fetch recruiter connections (attempt with index ordering)
        const q = query(
          connectionsRef,
          where("recruiterId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ConnectionItem[];
        
        // Sort client-side for absolute reliability across systems
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (err) {
        console.warn("Index warning, querying without ordering:", err);
        const fallbackQ = query(connectionsRef, where("recruiterId", "==", currentUser.uid));
        const querySnapshot = await getDocs(fallbackQ);
        fetched = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ConnectionItem[];
        fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      setConnections(fetched);
    } catch (err: any) {
      console.error("Error loading outgoing connections:", err);
      setError("Failed to load connections.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [currentUser?.uid]);

  const filteredConnections = connections.filter(conn => 
    conn.studentName.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 text-slate-200">
      
      {/* Page Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-[#1e293b]/70 to-slate-900 border border-slate-800/80 p-8 shadow-2xl text-left">
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[250px] h-[250px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -top-10 -left-10 w-[180px] h-[180px] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-semibold text-teal-400">
            <Briefcase className="w-3.5 h-3.5" /> Outgoing Requests
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            My Scholar Connections
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Monitor and audit previous student recruiter connections initiated on behalf of your hiring team. View candidates' action status and responsive messages.
          </p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-md">
        <div className="relative flex-1 w-full text-left">
          <Search className="absolute inset-y-0 left-4 my-auto w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search requested scholars by candidate name..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-800 focus:border-teal-500 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none text-slate-100 transition-colors"
          />
        </div>
      </div>

      {/* Connections List Rendering */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Syncing Outgoing Requests</h3>
            <p className="text-xs text-slate-500 mt-1">Interrogating live connection registry...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-center text-red-400 text-sm font-semibold max-w-md mx-auto">
          {error}
        </div>
      ) : filteredConnections.length === 0 ? (
        <div className="p-12 bg-slate-900/20 border border-slate-850 rounded-2xl text-center text-slate-400 max-w-lg mx-auto">
          <p className="text-sm italic">No outgoing connections matched your search.</p>
          <p className="text-xs text-slate-500 mt-1">Visit the "Find Students" tab to initiate connection handshakes with top scholars.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConnections.map((conn) => {
            return (
              <div 
                key={conn.id} 
                className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left relative overflow-hidden"
              >
                {/* Floating design element */}
                <div className="absolute top-0 right-0 w-[80px] h-[80px] bg-teal-500/5 rounded-full blur-[20px] pointer-events-none"></div>

                <div className="flex gap-4 items-start flex-1">
                  <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-xl shrink-0 mt-0.5">
                    🧑‍🎓
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-white">
                        {conn.studentName}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Sent on {new Date(conn.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-1.5 p-3.5 bg-slate-950/40 border border-slate-850/60 rounded-xl text-xs text-slate-300 leading-relaxed">
                      <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-slate-400">Invitation:</strong> "{conn.message}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connection Status badges */}
                <div className="shrink-0 self-stretch md:self-auto flex items-center justify-between border-t md:border-t-0 border-slate-900 pt-4 md:pt-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest hidden md:block">
                      Handshake Status
                    </span>
                    
                    {conn.status === "accepted" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 rounded-full">
                        <CheckCircle className="w-4 h-4" /> Connected & Verified
                      </span>
                    ) : conn.status === "declined" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400 rounded-full">
                        <XCircle className="w-4 h-4" /> Request Declined
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 rounded-full">
                        <Clock className="w-4 h-4" /> Pending Action
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
