import React from 'react';
import { Search, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const PosHeader = ({ searchTerm, setSearchTerm, selectedCategory, setSelectedCategory, categories, searchInputRef }) => {
    const { toast } = useToast();
    const handleScanClick = () => {
        toast({ title: "🚧 ฟีเจอร์นี้ยังไม่ได้พัฒนา—แต่ไม่ต้องกังวล! คุณสามารถขอให้เพิ่มในข้อความถัดไปได้! 🚀" });
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="ค้นหาสินค้า (ชื่อ, SKU)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <Button variant="outline" onClick={handleScanClick} className="lg:w-auto w-full">
                    <QrCode className="w-5 h-5 mr-2" />
                    สแกน
                </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-4">
                {categories.map((category) => (
                    <Button key={category} variant={selectedCategory === category ? "default" : "outline"} onClick={() => setSelectedCategory(category)} className="whitespace-nowrap">{category}</Button>
                ))}
            </div>
        </div>
    );
};

export default PosHeader;