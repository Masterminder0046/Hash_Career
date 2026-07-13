import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { HistoricalData } from '../models/HistoricalData';
import { Settings } from '../models/Settings';
import axios from 'axios';
import fs from 'fs';

export const uploadHistoricalData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No CSV file uploaded' });
    }

    const filePath = req.file.path;
    let fileContent = fs.readFileSync(filePath, 'utf-8');
    // Strip UTF-8 BOM if present (common in Windows Excel CSVs)
    if (fileContent.startsWith('\ufeff')) {
      fileContent = fileContent.slice(1);
    }
    const lines = fileContent.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV file is empty or missing headers' });
    }

    const headers = lines[0].toLowerCase().split(',').map((h) => h.trim());
    console.log('Parsed CSV Headers:', headers);
    
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length < headers.length) continue;

      const record: any = {};
      headers.forEach((header, index) => {
        const val = values[index];
        if (header === 'placed') {
          record[header] = val === '1' || val.toLowerCase() === 'true' || val.toLowerCase() === 'yes';
        } else {
          record[header] = parseFloat(val) || 0;
        }
      });
      records.push(record);
    }

    const docs = records.map((r) => ({
      cgpa: r.cgpa !== undefined ? r.cgpa : 0,
      skillsCount: r.skills_count !== undefined ? r.skills_count : (r.skillsCount !== undefined ? r.skillsCount : 0),
      projectsCount: r.projects_count !== undefined ? r.projects_count : (r.projectsCount !== undefined ? r.projectsCount : 0),
      internshipsCount: r.internships_count !== undefined ? r.internships_count : (r.internshipsCount !== undefined ? r.internshipsCount : 0),
      resumeScore: r.resume_score || r.resumeScore || 0,
      codingScore: r.coding_score || r.codingScore || 0,
      communicationScore: r.communication_score || r.communicationScore || 0,
      attendance: r.attendance || 0,
      certificationsCount: r.certifications_count || r.certificationsCount || 0,
      placed: r.placed !== undefined ? r.placed : false,
    }));

    await HistoricalData.insertMany(docs);

    const allData = await HistoricalData.find({});
    
    const mlRecords = allData.map((d) => ({
      cgpa: d.cgpa,
      skills_count: d.skillsCount,
      projects_count: d.projectsCount,
      internships_count: d.internshipsCount,
      resume_score: d.resumeScore,
      coding_score: d.codingScore,
      communication_score: d.communicationScore,
      attendance: d.attendance,
      certifications_count: d.certificationsCount,
      placed: d.placed ? 1 : 0,
    }));

    let mlResponse: any;
    try {
      mlResponse = await axios.post('http://localhost:5001/train', {
        records: mlRecords,
      });

      if (mlResponse.data && mlResponse.data.success && mlResponse.data.accuracy !== undefined) {
        let settings = await Settings.findOne({});
        if (!settings) {
          settings = new Settings({});
        }
        settings.mlModelAccuracy = mlResponse.data.accuracy;
        await settings.save();
      }
    } catch (err: any) {
      console.error('Error calling ML train endpoint:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Records saved, but failed to retrain the ML model. Ensure ML service is running.',
        error: err.message,
      });
    }

    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Error cleaning up file:', err);
    }

    res.json({
      success: true,
      message: 'Historical records successfully uploaded and ML model retrained!',
      data: mlResponse.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getRetrainingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalRecords = await HistoricalData.countDocuments();
    const settings = await Settings.findOne({});
    res.json({
      success: true,
      data: {
        totalRecords,
        modelLoaded: true,
        accuracy: settings?.mlModelAccuracy || null,
      },
    });
  } catch (error) {
    next(error);
  }
};
