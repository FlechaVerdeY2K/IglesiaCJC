import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FFAppState extends ChangeNotifier {
  static FFAppState _instance = FFAppState._internal();

  factory FFAppState() {
    return _instance;
  }

  FFAppState._internal();

  static void reset() {
    _instance = FFAppState._internal();
  }

  Future initializePersistedState() async {
    prefs = await SharedPreferences.getInstance();
    _safeInit(() {
      _verseIDs = prefs.getStringList('ff_verseIDs') ?? _verseIDs;
    });
  }

  void update(VoidCallback callback) {
    callback();
    notifyListeners();
  }

  late SharedPreferences prefs;

  List<String> _verseIDs = [
    'JER.29.11',
    'PSA.23.1-2',
    'PHP.4.13',
    'JHN.3.16',
    'ROM.8.28',
    'ISA.41.10',
    'PSA.46.1',
    'GAL.5.22-23',
    'HEB.11.1',
    '2TI.1.7',
    '1COR.10.13',
    'PRO.22.6',
    'ISA.40.31',
    'JOS.1.9',
    'HEB.12.2',
    'MAT.11.28',
    'MAT.6.23',
    'ROM.10.9-10',
    'PHP.2.3-4',
    'MAT.5.43-44',
    'PRO.3.3',
    'JHN.6.47',
    'ROM.12.2',
    'COL.3.23',
    'PSA.91.1-2',
    '1PED.5.7',
    'EFE.2.8-9',
    'ISA.26.3',
    'LAM.3.22-23',
    'JHN.14.27',
    'APOC.21.4'
  ];
  List<String> get verseIDs => _verseIDs;
  set verseIDs(List<String> value) {
    _verseIDs = value;
    prefs.setStringList('ff_verseIDs', value);
  }

  void addToVerseIDs(String value) {
    verseIDs.add(value);
    prefs.setStringList('ff_verseIDs', _verseIDs);
  }

  void removeFromVerseIDs(String value) {
    verseIDs.remove(value);
    prefs.setStringList('ff_verseIDs', _verseIDs);
  }

  void removeAtIndexFromVerseIDs(int index) {
    verseIDs.removeAt(index);
    prefs.setStringList('ff_verseIDs', _verseIDs);
  }

  void updateVerseIDsAtIndex(
    int index,
    String Function(String) updateFn,
  ) {
    verseIDs[index] = updateFn(_verseIDs[index]);
    prefs.setStringList('ff_verseIDs', _verseIDs);
  }

  void insertAtIndexInVerseIDs(int index, String value) {
    verseIDs.insert(index, value);
    prefs.setStringList('ff_verseIDs', _verseIDs);
  }
}

void _safeInit(Function() initializeField) {
  try {
    initializeField();
  } catch (_) {}
}

Future _safeInitAsync(Function() initializeField) async {
  try {
    await initializeField();
  } catch (_) {}
}
