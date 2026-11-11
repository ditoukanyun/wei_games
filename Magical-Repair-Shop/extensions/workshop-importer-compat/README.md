# Creator 3.8.8 importer compatibility

This project reproduced an editor startup failure where the built-in `engine-extends` package was enabled but the worker registry contained only `*`. Scenes, TypeScript and effects were then scanned as unknown assets. Preview failed in `SplashScreen.initWaterMark` before the game started. Launching through macOS `open` alone did not reliably prevent the failure.

This editor-only extension declares the existing official importer contributions again and forwards them to the installed Creator importer module. After registration it reimports internal effects, the workshop effect and project scripts, then requests preview reload. It does not run in exported games. The first recovery takes several seconds; check `.optimization-backup/workshop/importer-health.json` for completion.

This is a local compatibility workaround, not a verified vendor-level root-cause fix. Revalidate or remove it after upgrading Creator. All existing asset UUIDs are preserved. No third-party project assets or engine code are copied.
