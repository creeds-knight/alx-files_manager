import { tmpdir } from 'os';
import { join } from 'path';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

import getCurrentUser from '../utils/getUserToken';
import dbClient from '../utils/db';

const rootFolderId = 0; // Ensure rootFolderId is a string to match with parentId
const acceptedFileTypes = {
  folder: 'folder',
  file: 'file',
  image: 'image',
};

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

export default class FilesController {
  static async postUpload(req, res) {
    try {
      const userId = await getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        name, type, parentId = rootFolderId, isPublic = false, data = '',
      } = req.body || {};

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      if (!type || !Object.values(acceptedFileTypes).includes(type)) {
        return res.status(400).json({ error: 'Invalid type' });
      }
      if (type !== acceptedFileTypes.folder && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId !== rootFolderId) {
        const query = { _id: new ObjectId(parentId) };
        const file = await dbClient.client.db().collection('files').findOne(query);
        if (!file) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (file.type !== acceptedFileTypes.folder) {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // const userId = new ObjectId(user._id.toString());
      const newFile = {
        userId,
        name,
        type,
        isPublic,
        parentId: parentId === rootFolderId ? rootFolderId : parentId,
      };

      if (type === acceptedFileTypes.folder) {
        const insertedDoc = await dbClient.client.db().collection('files').insertOne(newFile);
        const fileId = insertedDoc.insertedId.toString();
        newFile.id = fileId;
        return res.status(201).json({
          id: fileId,
          ...newFile,
        });
      }

      const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0 ? process.env.FOLDER_PATH.trim() : join(tmpdir(), 'files_manager');
      await mkdir(baseDir, { recursive: true });
      const localPath = join(baseDir, uuidv4());
      await writeFile(localPath, Buffer.from(data, 'base64'));

      newFile[localPath] = localPath;
      const inserteddoc = await dbClient.client.db().collection('files').insertOne(newFile);
      const fileid = inserteddoc.insertedId.toString();
      newFile.id = fileid;
      return res.status(201).json({
        id: fileid,
        ...newFile,
      });
    } catch (error) {
      console.error('Error in postUpload:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async getShow(req, res) {
    try {
      const userId = await getCurrentUser(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Unauthorized' });
      }
      const query = { _id: new ObjectId(id), userId };
      const file = await dbClient.client.db().collection('files').findOne(query);
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }
      return res.status(200).json(file);
    } catch (err) {
      console.error('Error fetching file:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
