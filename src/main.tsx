// src/main.tsx
import React, { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import Post from "./pages/Post";
import About from "./pages/about";
import Tools from "./pages/Tools";
import NotFound from "./pages/NotFound";
import RequireAdmin from "./components/RequireAdmin";
import { AuthProvider } from "./context/AuthContext";

// Admin-only screens are split out of the public bundle: no visitor of the blog
// ever needs the editor, and the bundle is what stands between the page loading
// and the post being fetched.
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PostEditor = lazy(() => import("./pages/PostEditor"));
const ToolsDashboard = lazy(() => import("./pages/ToolsDashboard"));
const ToolEditor = lazy(() => import("./pages/ToolEditor"));

const loading = <p className="text-dim text-sm text-center py-16">Loading...</p>;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={loading}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:slug" element={<Post />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard/tools" element={<RequireAdmin><ToolsDashboard /></RequireAdmin>} />
            <Route path="/dashboard/tools/new" element={<RequireAdmin><ToolEditor key="new" /></RequireAdmin>} />
            <Route path="/dashboard/tools/edit/:id" element={<RequireAdmin><ToolEditor /></RequireAdmin>} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <RequireAdmin>
                  <Dashboard />
                </RequireAdmin>
              }
            />
            <Route
              path="/dashboard/new"
              element={
                <RequireAdmin>
                  <PostEditor />
                </RequireAdmin>
              }
            />
            <Route
              path="/dashboard/edit/:slug"
              element={
                <RequireAdmin>
                  <PostEditor />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
