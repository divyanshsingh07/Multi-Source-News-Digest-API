import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout.jsx";
import { Home } from "./pages/Home.jsx";
import { Topic } from "./pages/Topic.jsx";
import { ArticleDetail } from "./pages/ArticleDetail.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topic/:name" element={<Topic />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
