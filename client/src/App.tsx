import { Route, Routes } from "react-router-dom";
import { Nav } from "@/components/Nav";
import { AssistantWidget } from "@/components/AssistantWidget";
import { Home } from "@/pages/Home";
import { Discover } from "@/pages/Discover";
import { Search } from "@/pages/Search";
import { Destinations } from "@/pages/Destinations";
import { DestinationCity } from "@/pages/DestinationCity";
import { GroupBuy } from "@/pages/GroupBuy";
import { Resale } from "@/pages/Resale";
import { Product } from "@/pages/Product";
import { Skip } from "@/pages/Skip";
import { Chat } from "@/pages/Chat";
import { Hype } from "@/pages/Hype";
import { Deinfluence } from "@/pages/Deinfluence";
import { Cart } from "@/pages/Cart";
import { YourTaste } from "@/pages/YourTaste";
import { Iconic } from "@/pages/Iconic";

function App() {
  return (
    <div className="min-h-screen bg-ivory text-ink dark:bg-dark-bg dark:text-ivory">
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/search" element={<Search />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:city" element={<DestinationCity />} />
          <Route path="/group-buy" element={<GroupBuy />} />
          <Route path="/resale" element={<Resale />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/skip/:id" element={<Skip />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/hype-check" element={<Hype />} />
          <Route path="/deinfluence" element={<Deinfluence />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/your-taste" element={<YourTaste />} />
          <Route path="/iconic/:id" element={<Iconic />} />
        </Routes>
      </main>
      <AssistantWidget />
    </div>
  );
}

export default App;
