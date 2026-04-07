import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:image_picker/image_picker.dart';

class CloudinaryService {
  CloudinaryService._();
  static final CloudinaryService instance = CloudinaryService._();

  static const String _cloudName = 'djfnlzs0g';
  static const String _uploadPreset = 'cjc_uploads';
  static const String _uploadUrl =
      'https://api.cloudinary.com/v1_1/$_cloudName/image/upload';

  final _picker = ImagePicker();

  /// Abre el selector de imágenes y sube a Cloudinary.
  /// Retorna la URL segura o null si el usuario canceló o hubo error.
  Future<String?> pickAndUpload({
    required String folder,
    ImageSource source = ImageSource.gallery,
  }) async {
    try {
      final XFile? picked = await _picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 1200,
      );
      if (picked == null) return null;

      final bytes = await picked.readAsBytes();
      return await _uploadBytes(bytes, picked.name, folder: folder);
    } catch (e) {
      debugPrint('Cloudinary pickAndUpload error: $e');
      return null;
    }
  }

  Future<String?> _uploadBytes(
    Uint8List bytes,
    String filename, {
    required String folder,
  }) async {
    try {
      final request = http.MultipartRequest('POST', Uri.parse(_uploadUrl));
      request.fields['upload_preset'] = _uploadPreset;
      request.fields['folder'] = folder;
      request.files.add(http.MultipartFile.fromBytes(
        'file',
        bytes,
        filename: filename,
      ));

      final response = await request.send();
      final body = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        final json = jsonDecode(body);
        return json['secure_url'] as String?;
      } else {
        debugPrint('Cloudinary upload error ${response.statusCode}: $body');
        return null;
      }
    } catch (e) {
      debugPrint('Cloudinary upload exception: $e');
      return null;
    }
  }
}
