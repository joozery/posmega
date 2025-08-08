
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import BarcodeLabel from '@/components/BarcodeLabel';
import ColorPicker from './ColorPicker';

const defaultSettings = {
    format: "CODE128",
    width: 2,
    height: 40,
    displayValue: true,
    font: "monospace",
    textAlign: "center",
    textPosition: "bottom",
    textMargin: 2,
    fontSize: 20,
    background: "#ffffff",
    lineColor: "#000000",
    margin: 10,
    showName: true,
    showPrice: true,
    showSku: true,
    nameBold: true,
    priceBold: true,
    labelWidth: 240,
    labelHeight: 140,
};

const BarcodeSettingsTab = () => {
    const { toast } = useToast();
    const [settings, setSettings] = useState(defaultSettings);

    useEffect(() => {
        const savedSettings = localStorage.getItem('pos_barcode_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveSettings = () => {
        localStorage.setItem('pos_barcode_settings', JSON.stringify(settings));
        toast({ title: "บันทึกสำเร็จ", description: "การตั้งค่าบาร์โค้ดถูกบันทึกแล้ว" });
    };
    
    const handleResetSettings = () => {
        setSettings(defaultSettings);
        localStorage.removeItem('pos_barcode_settings');
        toast({ title: "รีเซ็ตสำเร็จ", description: "การตั้งค่าบาร์โค้ดกลับเป็นค่าเริ่มต้น" });
    }

    const sampleProduct = {
        name: "สินค้าตัวอย่าง",
        barcode: "123456789",
        price: 999.75,
        originalPrice: 1200,
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">ตั้งค่าป้ายบาร์โค้ด</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleResetSettings}>รีเซ็ต</Button>
                        <Button onClick={handleSaveSettings}>บันทึก</Button>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="font-medium">ขนาดป้าย (px)</label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <p className="text-sm text-gray-600">กว้าง ({settings.labelWidth})</p>
                                <Slider defaultValue={[settings.labelWidth]} max={400} min={100} step={10} onValueChange={([val]) => handleSettingChange('labelWidth', val)} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">สูง ({settings.labelHeight})</p>
                                <Slider defaultValue={[settings.labelHeight]} max={250} min={80} step={10} onValueChange={([val]) => handleSettingChange('labelHeight', val)} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="font-medium">การแสดงผล</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                            <div className="flex items-center space-x-2"><Switch id="showName" checked={settings.showName} onCheckedChange={(val) => handleSettingChange('showName', val)} /><label htmlFor="showName">ชื่อสินค้า</label></div>
                            <div className="flex items-center space-x-2"><Switch id="showPrice" checked={settings.showPrice} onCheckedChange={(val) => handleSettingChange('showPrice', val)} /><label htmlFor="showPrice">ราคา</label></div>
                            <div className="flex items-center space-x-2"><Switch id="showSku" checked={settings.showSku} onCheckedChange={(val) => handleSettingChange('showSku', val)} /><label htmlFor="showSku">รหัส Barcode</label></div>
                            <div className="flex items-center space-x-2"><Switch id="nameBold" checked={settings.nameBold} onCheckedChange={(val) => handleSettingChange('nameBold', val)} /><label htmlFor="nameBold">ชื่อตัวหนา</label></div>
                            <div className="flex items-center space-x-2"><Switch id="priceBold" checked={settings.priceBold} onCheckedChange={(val) => handleSettingChange('priceBold', val)} /><label htmlFor="priceBold">ราคาตัวหนา</label></div>
                        </div>
                    </div>

                    <div>
                        <label className="font-medium">ตั้งค่าบาร์โค้ด</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            <div>
                                <p className="text-sm text-gray-600">ความกว้างเส้น ({settings.width})</p>
                                <Slider defaultValue={[settings.width]} max={4} min={1} step={0.5} onValueChange={([val]) => handleSettingChange('width', val)} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">ความสูง ({settings.height})</p>
                                <Slider defaultValue={[settings.height]} max={100} min={20} step={5} onValueChange={([val]) => handleSettingChange('height', val)} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">ระยะขอบ ({settings.margin})</p>
                                <Slider defaultValue={[settings.margin]} max={30} min={0} step={1} onValueChange={([val]) => handleSettingChange('margin', val)} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">ตำแหน่งข้อความ</p>
                                <Select value={settings.textPosition} onValueChange={(val) => handleSettingChange('textPosition', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="top">ด้านบน</SelectItem>
                                        <SelectItem value="bottom">ด้านล่าง</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm text-gray-600 mb-2">สีของบาร์โค้ด</p>
                                <ColorPicker color={settings.lineColor} onChange={(val) => handleSettingChange('lineColor', val)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-center">
                <div className="scale-125">
                    <BarcodeLabel product={sampleProduct} settings={settings} />
                </div>
            </div>
        </motion.div>
    );
};

export default BarcodeSettingsTab;
